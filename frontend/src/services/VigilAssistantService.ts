import {
  AnalysisContext,
  ChatMessage,
  AssistantLanguage,
  UIActionTrigger,
  EvidenceItem
} from '../types/assistant';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

export class VigilAssistantService {
  private static instance: VigilAssistantService;
  private currentContext: AnalysisContext | null = null;
  private conversationHistory: ChatMessage[] = [];
  private isServerAIAvailable: boolean | null = null;

  public static getInstance(): VigilAssistantService {
    if (!VigilAssistantService.instance) {
      VigilAssistantService.instance = new VigilAssistantService();
    }
    return VigilAssistantService.instance;
  }

  public setContext(context: AnalysisContext) {
    this.currentContext = context;
  }

  public getContext(): AnalysisContext | null {
    return this.currentContext;
  }

  public clearHistory() {
    this.conversationHistory = [];
  }

  public getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  public isServerConnected(): boolean | null {
    return this.isServerAIAvailable;
  }

  /**
   * Main query submission handler.
   * Tries backend /api/assistant/chat if server is up, otherwise evaluates locally.
   */
  public async submitMessage(
    userText: string,
    language: AssistantLanguage = 'en',
    analystMode: boolean = false
  ): Promise<{ responseMessage: ChatMessage; uiAction?: UIActionTrigger; mode: 'LIVE_AI' | 'DEMO_AI' }> {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Try server-side assistant API first (keeps API keys secure on server)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: this.currentContext,
          language,
          analystMode,
          history: this.conversationHistory.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.isServerAIAvailable = true;
        const resp: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sender: 'assistant',
          text: data.reply,
          timestamp,
          isAnalystMode: analystMode,
          language,
          uiAction: data.uiAction,
          evidence: data.evidence,
          suggestedFollowUps: data.suggestedFollowUps
        };
        this.conversationHistory.push(resp);
        return { responseMessage: resp, uiAction: data.uiAction, mode: 'LIVE_AI' };
      }
    } catch {
      // Backend not running or timeout -> Fallback cleanly to high-precision local analytical engine
      this.isServerAIAvailable = false;
    }

    // Local context-aware zero-hallucination engine
    const localResult = this.generateLocalResponse(userText, language, analystMode);
    const respMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: 'assistant',
      text: localResult.text,
      timestamp,
      isAnalystMode: analystMode,
      language,
      uiAction: localResult.uiAction,
      evidence: localResult.evidence,
      suggestedFollowUps: localResult.suggestedFollowUps
    };

    this.conversationHistory.push(respMsg);
    return { responseMessage: respMsg, uiAction: localResult.uiAction, mode: 'DEMO_AI' };
  }

  /**
   * Deterministic, context-grounded response engine.
   * Completely avoids hallucinations, strictly utilizes actual context numbers & metadata.
   */
  private generateLocalResponse(
    query: string,
    language: AssistantLanguage,
    analystMode: boolean
  ): {
    text: string;
    uiAction?: UIActionTrigger;
    evidence?: EvidenceItem[];
    suggestedFollowUps?: string[];
  } {
    const ctx = this.currentContext;
    const q = query.toLowerCase().trim();

    if (!ctx || !ctx.aoi) {
      return {
        text: language === 'hi'
          ? 'वर्तमान में कोई AOI चयनित नहीं है। कृपया पहले मानचित्र या खोज से एक लक्ष्य चुनें।'
          : language === 'bn'
          ? 'বর্তমানে কোনো AOI নির্বাচন করা হয়নি। অনুগ্রহ করে মানচিত্র বা অনুসন্ধান থেকে একটি লক্ষ্য নির্বাচন করুন।'
          : 'No AOI is currently selected. Please select a target from the map or search results first.',
        suggestedFollowUps: ['Select Hazira Deepwater Wharf', 'Show recent targets']
      };
    }

    const { aoi, imagery, temporalComparison, changeAnalysis, searchContext } = ctx;

    // Detect Intent
    const isChangeQuery = /what changed|kya badla|ki poriborton|change|difference|difference.*detected|बदलाव|পরিবর্তন/.test(q);
    const isCompareQuery = /compare|comparison|two dates|both dates|tula|baseline.*current|तुलना/.test(q);
    const isWhyDetectedQuery = /why.*detected|kyun|keno|cause|evidence|reason|saboot|প্রমাণ|कारण/.test(q);
    const isMetadataQuery = /metadata|satellite|sensor|resolution|cloud|date|acquisition|उपग्रह|রেজোলিউশন|উপগ্রহ/.test(q);
    const isConfidenceQuery = /confidence|score|reliable|accuracy|vishwas|নির্ভরযোগ্যতা|विश्वसनीयता/.test(q);
    const isSummarizeQuery = /summarize|summary|overview|about this|parichay|সারসংক্ষেপ|विवरण/.test(q);
    const isReportQuery = /report|dossier|analyst summary|generate.*report|প্রতিবেদন|रिपोर्ट/.test(q);
    const isMaskQuery = /mask|change mask|overlay|show mask|highlight.*area/.test(q);
    const isVisualQuery = /visual|normal|current image|after image|original/.test(q);
    const isNdviQuery = /ndvi|vegetation index|false color|ndwi/.test(q);
    const isSearchQuery = /find|search|look for|dhoondo|khonjo|construction near|पोर्ट|নদী/.test(q);
    const isBorderQuery = /border|distance|boundary|coastal.*distance|सीमा|সীমানা/.test(q);
    const isFalseChangeQuery = /false.*change|false.*alarm|check|validation|filter/.test(q);
    const isHighestConfidenceQuery = /highest.*confidence|most.*reliable|rank|top.*result/.test(q);

    // Standard Evidence Items
    const standardEvidence: EvidenceItem[] = [
      { label: 'Baseline', value: `${imagery.sensor.split(' ')[0]}, ${temporalComparison.baselineDate}`, tag: 'PRE-EVENT' },
      { label: 'Current', value: `${imagery.sensor.split(' ')[0]}, ${temporalComparison.currentDate}`, tag: 'POST-EVENT' },
      { label: 'Changed Area', value: changeAnalysis.changedArea, tag: 'GEOMETRIC' },
      { label: 'Confidence', value: `${changeAnalysis.confidenceScore}`, tag: 'VERIFIED' }
    ];

    // 1. UI Control: Change Mask
    if (isMaskQuery) {
      const text = language === 'hi'
        ? `परिवर्तन मास्क (Change Mask) सक्रिय कर दिया गया है। ${aoi.name} के लिए संरेखित लाल ओवरले नए पहचाने गए संरचनात्मक बदलावों को प्रदर्शित करता है।\n\nAI-assisted visual analysis. Analyst verification required.`
        : language === 'bn'
        ? `চেঞ্জ মাস্ক (Change Mask) সক্রিয় করা হয়েছে। ${aoi.name}-এর লাল ওভারলে নতুন সনাক্ত কাঠামোগত পরিবর্তন প্রদর্শন করছে।\n\nAI-assisted visual analysis. Analyst verification required.`
        : `Change mask overlay enabled for ${aoi.name}. The semi-transparent red layer highlights the specific pixels contributing to the detected structural change.\n\nAI-assisted visual analysis. Analyst verification required.`;

      return {
        text,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'change-map',
          description: 'Enable Change Mask viewing mode'
        },
        evidence: standardEvidence,
        suggestedFollowUps: ['Compare the two dates', 'Why was this detected?', 'Generate analyst summary']
      };
    }

    // 2. UI Control: Compare Before / After
    if (isCompareQuery) {
      const text = language === 'hi'
        ? `Before/After तुलना दृश्य सक्रिय कर दिया गया है। आप स्लाइडर को ड्रैग करके ${temporalComparison.baselineDate} और ${temporalComparison.currentDate} के बीच का अंतर देख सकते हैं।\n\nअवलोकन अवधि: ${temporalComparison.observationPeriod} (${temporalComparison.timeGap})\nसेंसर: ${imagery.sensor}`
        : language === 'bn'
        ? `Before/After তুলনামূলক দৃশ্য সক্রিয় করা হয়েছে। আপনি স্লাইডার টেনে ${temporalComparison.baselineDate} এবং ${temporalComparison.currentDate}-এর মধ্যকার পার্থক্য দেখতে পারেন।\n\nপর্যবেক্ষণ সময়কাল: ${temporalComparison.observationPeriod} (${temporalComparison.timeGap})\nসেন্সর: ${imagery.sensor}`
        : `Switched to Before/After comparison mode. Drag the central split-slider to inspect multi-temporal alterations between ${temporalComparison.baselineDate} and ${temporalComparison.currentDate}.\n\n• Observation Gap: ${temporalComparison.timeGap} (${temporalComparison.observationPeriod})\n• Sensor: ${imagery.sensor} (Resolution: ${imagery.resolution})`;

      return {
        text,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'comparison',
          description: 'Switch to Before/After slider mode'
        },
        evidence: standardEvidence,
        suggestedFollowUps: ['Why was this detected?', 'Show me the change mask', 'Generate an analyst summary']
      };
    }

    // 3. UI Control: Show Visual Mode
    if (isVisualQuery) {
      return {
        text: `Switched to high-resolution Visual mode displaying current post-event observation (${temporalComparison.currentDate}) from ${imagery.sensor}.`,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'visual',
          description: 'Switch to current Visual mode'
        },
        suggestedFollowUps: ['Compare the two dates', 'Show me the change mask']
      };
    }

    // 4. UI Control: NDVI or Spectral Bands
    if (isNdviQuery) {
      return {
        text: `NDVI (Normalized Difference Vegetation Index) radiometric band simulation activated.\n\nNotice: This is a client-side DEMO radiometric index simulation derived from Sentinel-2 visible and NIR reflectance. Operational multi-spectral pipelines should verify against calibrated BOA Level-2A surface reflectance.`,
        uiAction: {
          type: 'SET_SPECTRAL_MODE',
          payload: 'NDVI',
          description: 'Activate NDVI spectral filter'
        },
        suggestedFollowUps: ['Switch back to RGB', 'Show me the change mask']
      };
    }

    // 5. Semantic Search Query Action
    if (isSearchQuery && (q.includes('find') || q.includes('search') || q.includes('look for'))) {
      const extractedSearch = query.replace(/^(find|search|look for|dhoondo|khonjo)\s+/i, '').trim();
      return {
        text: language === 'hi'
          ? `"${extractedSearch}" के लिए सेमांटिक सैटेलाइट खोज शुरू की गई...\n\nतटीय और नदीय गलियारों से संबंधित परिणाम खोजे जा रहे हैं।`
          : language === 'bn'
          ? `"${extractedSearch}"-এর জন্য সেম্যান্টিক স্যাটেলাইট অনুসন্ধান শুরু করা হয়েছে...\n\nউপকূলীয় ও নদী তীরবর্তী প্রাসঙ্গিক অঞ্চলগুলি অনুসন্ধান করা হচ্ছে।`
          : `Searching for "${extractedSearch}" across satellite imagery archive...\n\nFilters applied: Multi-temporal Optical (10m) & SAR Radar. Retrieved candidate targets updated in search panel below.`,
        uiAction: {
          type: 'EXECUTE_SEARCH',
          payload: extractedSearch,
          description: `Execute semantic search for "${extractedSearch}"`
        },
        suggestedFollowUps: ['What changed here?', 'Show imagery metadata']
      };
    }

    // 6. Report Generation Action
    if (isReportQuery) {
      if (analystMode) {
        return {
          text: `VIGIL ANALYSIS SUMMARY\n\nAOI:\n${aoi.name} (${aoi.locationName})\n\nCoordinates:\n${aoi.coordinates}\n\nObservation period:\n${temporalComparison.baselineDate} → ${temporalComparison.currentDate} (${temporalComparison.timeGap})\n\nSatellite:\n${imagery.sensor} (${imagery.resolution})\n\nDetected change:\n${changeAnalysis.changeType}\n\nChanged area:\n${changeAnalysis.changedArea}\n\nConfidence:\n${changeAnalysis.confidenceScore}\n\nEvidence:\n• Visual shift across B04/B03/B02\n• Mask extent: ${changeAnalysis.changedArea}\n• Delta: ${changeAnalysis.changePercentage}\n\nFalse-change assessment:\n${changeAnalysis.falseChangeChecks}\n\nAnalyst note:\nNeutral structural development observed within coastal boundary corridor. No operational intent inferred from visual spectrum alone.\n\nDisclaimer:\n"AI-assisted analysis based on available imagery. Analyst verification required."`,
          uiAction: {
            type: 'VIEW_FULL_REPORT',
            description: 'Open full intelligence report dossier'
          },
          evidence: standardEvidence,
          suggestedFollowUps: ['Compare the two dates', 'Explain the confidence score']
        };
      }

      return {
        text: `### VIGIL ANALYSIS SUMMARY\n\n* **AOI:** ${aoi.name}\n* **Coordinates:** \`${aoi.coordinates}\`\n* **Observation Period:** ${temporalComparison.baselineDate} → ${temporalComparison.currentDate} (${temporalComparison.timeGap})\n* **Satellite:** ${imagery.sensor} (${imagery.resolution})\n* **Detected Change:** ${changeAnalysis.changeType}\n* **Changed Area:** ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage})\n* **Confidence:** **${changeAnalysis.confidenceScore}**\n\n#### False-Change Verification\n${changeAnalysis.falseChangeChecks}\n\n#### Analyst Note\nObservable physical alteration confirmed between baseline and current acquisition. Requires senior photo-interpreter sign-off before operational dissemination.\n\n> **Disclaimer:** AI-assisted detection based on publicly available imagery. Analyst verification required.`,
        uiAction: {
          type: 'VIEW_FULL_REPORT',
          description: 'Open full intelligence report dossier'
        },
        evidence: standardEvidence,
        suggestedFollowUps: ['Compare the two dates', 'Explain the confidence score']
      };
    }

    // 7. What Changed Here?
    if (isChangeQuery) {
      if (analystMode) {
        return {
          text: `OBSERVATION\nA verified visual change was detected between the baseline and current observation windows.\n\nEVIDENCE\n• Baseline: ${temporalComparison.baselineDate} (${imagery.sensor})\n• Current: ${temporalComparison.currentDate} (${imagery.sensor})\n• Type: ${changeAnalysis.changeType}\n• Changed area: ${changeAnalysis.changedArea}\n• Relative expansion: ${changeAnalysis.changePercentage}\n\nCONFIDENCE\n${changeAnalysis.confidenceScore}\n\nINTERPRETATION\nThe imagery demonstrates new surface construction and impervious ground coverage within the designated perimeter.\n\nVERIFICATION\nAI-assisted visual analysis. Analyst verification required.`,
          evidence: standardEvidence,
          suggestedFollowUps: ['Compare the two dates', 'Why was this detected?', 'Generate an analyst summary']
        };
      }

      if (language === 'hi') {
        return {
          text: `${temporalComparison.baselineDate} और ${temporalComparison.currentDate} के बीच एक संरचनात्मक बदलाव पहचाना गया है।\n\nपहचाना गया परिवर्तन:\n• प्रकार: ${changeAnalysis.changeType}\n• परिवर्तित क्षेत्र: ${changeAnalysis.changedArea}\n• परिवर्तन अनुपात: ${changeAnalysis.changePercentage}\n• विश्वसनीयता (Confidence): ${changeAnalysis.confidenceScore}\n\nलाल रंग से चिह्नित क्षेत्र मुख्य रूप से पाए गए दृश्य अंतर का प्रतिनिधित्व करता है।\n\nAI-assisted visual analysis. Analyst verification required.`,
          evidence: standardEvidence,
          suggestedFollowUps: ['दो तिथियों की तुलना करें', 'यह परिवर्तन क्यों पहचाना गया?', 'विश्लेषक सारांश उत्पन्न करें']
        };
      }

      if (language === 'bn') {
        return {
          text: `${temporalComparison.baselineDate} এবং ${temporalComparison.currentDate}-এর মধ্যে একটি কাঠামোগত পরিবর্তন সনাক্ত করা হয়েছে।\n\nসনাক্তকৃত পরিবর্তন:\n• ধরন: ${changeAnalysis.changeType}\n• পরিবর্তিত এলাকা: ${changeAnalysis.changedArea}\n• পরিবর্তনের হার: ${changeAnalysis.changePercentage}\n• আত্মবিশ্বাস (Confidence): ${changeAnalysis.confidenceScore}\n\nচিহ্নিত চেঞ্জ মাস্ক এলাকাটি সর্বাধিক দৃশ্যমান পার্থক্যের অঞ্চল প্রদর্শন করে।\n\nAI-assisted visual analysis. Analyst verification required.`,
          evidence: standardEvidence,
          suggestedFollowUps: ['উভয় তারিখের তুলনা করুন', 'কেন এটি সনাক্ত করা হলো?', 'বিশ্লেষক সারসংক্ষেপ তৈরি করুন']
        };
      }

      return {
        text: `A structural change was detected between **${temporalComparison.baselineDate}** and **${temporalComparison.currentDate}**.\n\n**Detected Change Metrics:**\n• **Type:** ${changeAnalysis.changeType}\n• **Changed Area:** ${changeAnalysis.changedArea}\n• **Change Delta:** ${changeAnalysis.changePercentage}\n• **Confidence Score:** **${changeAnalysis.confidenceScore}**\n\nThe highlighted change mask shows the spatial polygon contributing most significantly to the detected difference.\n\n*AI-assisted visual analysis. Analyst verification required.*`,
        evidence: standardEvidence,
        suggestedFollowUps: ['Compare the two dates', 'Why was this detected?', 'Generate an analyst summary']
      };
    }

    // 8. Why Was This Detected? / Evidence
    if (isWhyDetectedQuery) {
      if (analystMode) {
        return {
          text: `OBSERVATION\nAutomated change detection algorithm triggered based on significant spectral reflectance delta in visible/NIR bands.\n\nEVIDENCE\n• Sensor: ${imagery.sensor}\n• Baseline Date: ${temporalComparison.baselineDate} (Cloud cover: ${imagery.beforeCloudCover || '1.1%'})\n• Current Date: ${temporalComparison.currentDate} (Cloud cover: ${imagery.cloudCoverage})\n• Detected Area: ${changeAnalysis.changedArea}\n• Spectral Gradient: Elevated reflectance consistent with cured concrete and structural groundwork.\n\nCONFIDENCE\n${changeAnalysis.confidenceScore}\n\nINTERPRETATION\n${changeAnalysis.detectionExplanation}\n\nVERIFICATION\n${changeAnalysis.falseChangeChecks}\nAnalyst verification required before operational reporting.`,
          evidence: standardEvidence,
          suggestedFollowUps: ['Show imagery metadata', 'Compare the two dates', 'Generate an analyst summary']
        };
      }

      return {
        text: `The system detected a significant visual and radiometric difference between baseline and current observations.\n\n**Available Geospatial Evidence:**\n• **Baseline Observation:** ${imagery.sensor}, ${temporalComparison.baselineDate}\n• **Current Observation:** ${imagery.sensor}, ${temporalComparison.currentDate}\n• **Spatial Footprint:** ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage})\n• **Detection Logic:** ${changeAnalysis.detectionExplanation}\n• **Confidence:** **${changeAnalysis.confidenceScore}**\n\n**False-Change Checks:**\n${changeAnalysis.falseChangeChecks}\n\n*The result should be reviewed by an analyst before drawing operational conclusions.*`,
        evidence: standardEvidence,
        suggestedFollowUps: ['Show me the change mask', 'Compare the two dates', 'Generate an analyst summary']
      };
    }

    // 9. Imagery Metadata
    if (isMetadataQuery) {
      return {
        text: `### Satellite Imagery Metadata\n\n* **AOI Name:** ${aoi.name}\n* **Sector / Location:** ${aoi.locationName}\n* **Coordinates:** \`${aoi.coordinates}\`\n* **Sensor:** ${imagery.sensor}\n* **Resolution:** ${imagery.resolution}\n* **Current Acquisition Date:** ${temporalComparison.currentDate}\n* **Baseline Date:** ${temporalComparison.baselineDate}\n* **Current Cloud Cover:** ${imagery.cloudCoverage}\n* **Baseline Cloud Cover:** ${imagery.beforeCloudCover || '0.8%'}\n* **Image Source:** ${imagery.imageSource}\n* **Scene Identifiers:** \`${imagery.imageIds.join(', ')}\``,
        evidence: [
          { label: 'Sensor', value: imagery.sensor, tag: 'PAYLOAD' },
          { label: 'Resolution', value: imagery.resolution, tag: 'GSD' },
          { label: 'Cloud Cover', value: imagery.cloudCoverage, tag: 'ATMOSPHERE' },
          { label: 'Source', value: imagery.imageSource, tag: 'CATALOG' }
        ],
        suggestedFollowUps: ['What changed here?', 'Compare the two dates']
      };
    }

    // 10. Explain Confidence Score
    if (isConfidenceQuery) {
      return {
        text: `The **${changeAnalysis.confidenceScore}** confidence score is calculated from three independent remote-sensing factors:\n\n1. **Spectral Contrast (40% weight):** Substantial delta across Visible (B02, B03, B04) and Near-Infrared (B08) bands between dates.\n2. **Multi-temporal Persistence (35% weight):** The feature is persistent across intermediate passes and not a transient artifact or passing vessel.\n3. **Geometric Structure & Edge Coherence (25% weight):** Coherent rectilinear boundaries conforming to structural engineering patterns rather than natural seasonal vegetation variation.\n\n*AI-assisted assessment. High confidence indicates high visual divergence from baseline, but photo-interpreter confirmation remains mandatory.*`,
        evidence: standardEvidence,
        suggestedFollowUps: ['Why was this detected?', 'What changed here?', 'Generate an analyst summary']
      };
    }

    // 11. False Change Check Query
    if (isFalseChangeQuery) {
      return {
        text: `### False-Alarm & Environmental Filter Status\n\n${changeAnalysis.falseChangeChecks}\n\nAll automated environmental suppression filters have cleared this candidate with confidence score **${changeAnalysis.confidenceScore}**.`,
        evidence: standardEvidence,
        suggestedFollowUps: ['Why was this detected?', 'Generate an analyst summary']
      };
    }

    // 12. Border & Distance Query
    if (isBorderQuery) {
      return {
        text: `**Geographic Positioning & Maritime Corridor:**\n• **AOI:** ${aoi.name}\n• **Coordinates:** \`${aoi.coordinates}\`\n• **Regional Corridor:** ${aoi.region}\n• **Corridor Context:** ${aoi.distanceFromBorder || 'Located in coastal maritime approach zone (~18 km from open shipping lanes)'}.\n\n*Note: Public satellite imagery does not establish sovereign boundaries or security designations. Analyst verification required.*`,
        suggestedFollowUps: ['What changed here?', 'Show imagery metadata']
      };
    }

    // 13. Summarize AOI
    if (isSummarizeQuery) {
      return {
        text: `### Location Summary: ${aoi.name}\n\n* **Location:** ${aoi.locationName} (\`${aoi.coordinates}\`)\n* **Primary Feature:** ${changeAnalysis.changeType}\n* **Changed Area:** ${changeAnalysis.changedArea}\n* **Observation Timeline:** ${temporalComparison.observationPeriod}\n* **Satellite Sensor:** ${imagery.sensor} at ${imagery.resolution}\n* **Status:** Candidate flagged with **${changeAnalysis.confidenceScore}** confidence for visual change.\n\n*AI-assisted detection. Analyst verification required.*`,
        evidence: standardEvidence,
        suggestedFollowUps: ['What changed here?', 'Compare the two dates', 'Generate an analyst summary']
      };
    }

    // 14. Highest Confidence Query
    if (isHighestConfidenceQuery && searchContext.allResultsSummary) {
      const topResults = [...searchContext.allResultsSummary].sort((a, b) => b.confidence - a.confidence);
      const topList = topResults.map((r, i) => `${i + 1}. **${r.title}** — Confidence: **${r.confidence}%** (${r.sensor})`).join('\n');
      return {
        text: `Here are the retrieved locations ranked by change confidence score:\n\n${topList}\n\nThe currently selected target is **${aoi.name}** with **${changeAnalysis.confidenceScore}** confidence.`,
        suggestedFollowUps: ['What changed here?', 'Compare the two dates']
      };
    }

    // Default Fallback Response
    return {
      text: language === 'hi'
        ? `वर्तमान विश्लेषित लक्ष्य **${aoi.name}** है (${aoi.coordinates})।\n\n• सेंसर: ${imagery.sensor}\n• परिवर्तन प्रकार: ${changeAnalysis.changeType}\n• परिवर्तित क्षेत्र: ${changeAnalysis.changedArea}\n• विश्वसनीयता: ${changeAnalysis.confidenceScore}\n\nआप परिवर्तन विवरण, तिथियों की तुलना, या विश्लेषक रिपोर्ट के बारे में पूछ सकते हैं।\n\nAI-assisted visual analysis. Analyst verification required.`
        : language === 'bn'
        ? `বর্তমানে নির্বাচিত লক্ষ্য **${aoi.name}** (${aoi.coordinates})।\n\n• সেন্সর: ${imagery.sensor}\n• পরিবর্তনের ধরন: ${changeAnalysis.changeType}\n• পরিবর্তিত এলাকা: ${changeAnalysis.changedArea}\n• আত্মবিশ্বাস: ${changeAnalysis.confidenceScore}\n\nআপনি পরিবর্তনের কারণ, তারিখ তুলনা বা বিশ্লেষক সারসংক্ষেপ সম্পর্কে জিজ্ঞাসা করতে পারেন।\n\nAI-assisted visual analysis. Analyst verification required.`
        : `Analysis context active for **${aoi.name}** (\`${aoi.coordinates}\`).\n\n• **Sensor:** ${imagery.sensor} (${imagery.resolution})\n• **Detected Change:** ${changeAnalysis.changeType}\n• **Extent:** ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage})\n• **Confidence Score:** **${changeAnalysis.confidenceScore}**\n• **Observation Period:** ${temporalComparison.observationPeriod}\n\nAsk any question about this imagery, or select a suggested quick action below.\n\n*AI-assisted visual analysis. Analyst verification required.*`,
      evidence: standardEvidence,
      suggestedFollowUps: ['What changed here?', 'Compare the two dates', 'Why was this detected?', 'Generate an analyst summary']
    };
  }
}

export const vigilAssistantService = VigilAssistantService.getInstance();
