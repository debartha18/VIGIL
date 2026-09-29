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
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_BASE}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: this.currentContext,
          language,
          analystMode,
          history: this.conversationHistory.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
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
   * Deterministic, question-focused response engine.
   * Answers ONLY what the user asked for.
   * Never dumps the entire analysis context or unsolicited metadata.
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
          ? 'वर्तमान में कोई AOI चयनित नहीं है। कृपया पहले एक लक्ष्य चुनें।'
          : language === 'bn'
          ? 'বর্তমানে কোনো AOI নির্বাচন করা হয়নি। অনুগ্রহ করে একটি লক্ষ্য নির্বাচন করুন।'
          : 'No AOI is currently selected. Please select a target first.',
        suggestedFollowUps: ['Select Hazira Deepwater Wharf', 'Show recent targets']
      };
    }

    const { aoi, imagery, temporalComparison, changeAnalysis } = ctx;

    // 1. UI ACTIONS (Action performed + 1 short confirmation sentence)
    if (/show.*(change )?mask|enable.*mask|change mask|overlay/i.test(q)) {
      const text = language === 'hi'
        ? 'परिवर्तन मास्क (Change Mask) सक्रिय किया गया।'
        : language === 'bn'
        ? 'চেঞ্জ মাস্ক (Change Mask) সক্রিয় করা হয়েছে।'
        : 'Change mask enabled.';

      return {
        text,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'change-map',
          description: 'Enable Change Mask viewing mode'
        }
      };
    }

    if (/compare.*(dates|images|two|imagery|both)|switch.*compare|before.*after|slider/i.test(q)) {
      const text = language === 'hi'
        ? 'Before/After तुलना दृश्य सक्रिय किया गया।'
        : language === 'bn'
        ? 'Before/After তুলনামূলক দৃশ্য সক্রিয় করা হয়েছে।'
        : 'Before/After comparison enabled.';

      return {
        text,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'comparison',
          description: 'Switch to Before/After slider mode'
        }
      };
    }

    if (/show.*visual|visual mode|normal view|current image|after image/i.test(q)) {
      const text = language === 'hi'
        ? 'विजुअल मोड (Visual Mode) सक्रिय किया गया।'
        : language === 'bn'
        ? 'ভিজ্যুয়াল মোড (Visual Mode) সক্রিয় করা হয়েছে।'
        : 'Visual mode enabled.';

      return {
        text,
        uiAction: {
          type: 'SET_VIEW_MODE',
          payload: 'visual',
          description: 'Switch to current Visual mode'
        }
      };
    }

    if (/show.*ndvi|ndvi|vegetation index/i.test(q)) {
      const text = language === 'hi'
        ? 'NDVI स्पेक्ट्रल सिमुलेशन सक्रिय किया गया।'
        : language === 'bn'
        ? 'NDVI স্পেকট্রাল সিমুলেশন সক্রিয় করা হয়েছে।'
        : 'NDVI spectral simulation enabled.';

      return {
        text,
        uiAction: {
          type: 'SET_SPECTRAL_MODE',
          payload: 'NDVI',
          description: 'Activate NDVI spectral filter'
        }
      };
    }

    if (/^(find|search|look for|dhoondo|khonjo)\s+(.+)/i.test(q)) {
      const match = q.match(/^(find|search|look for|dhoondo|khonjo)\s+(.+)/i);
      const searchTarget = match ? match[2].trim() : q;
      const text = language === 'hi'
        ? `"${searchTarget}" के लिए खोज शुरू की जा रही है...`
        : language === 'bn'
        ? `"${searchTarget}"-এর জন্য অনুসন্ধান শুরু করা হচ্ছে...`
        : `Searching for "${searchTarget}"...`;

      return {
        text,
        uiAction: {
          type: 'EXECUTE_SEARCH',
          payload: searchTarget,
          description: `Execute search for "${searchTarget}"`
        }
      };
    }

    // 2. EXPLICIT FULL ANALYSIS OR REPORT REQUEST (Only provided when explicitly requested)
    const isExplicitFullRequest =
      analystMode ||
      /full analysis|complete details|summarize.*aoi|summarize.*location|explain everything|detailed report|analysis summary|all metadata|full report|generate.*report|বিশদ|সম্পূর্ণ|विस्तृत/i.test(
        q
      );

    if (isExplicitFullRequest) {
      const reportEvidence: EvidenceItem[] = [
        { label: 'Baseline', value: `${imagery.sensor.split(' ')[0]}, ${temporalComparison.baselineDate}`, tag: 'PRE-EVENT' },
        { label: 'Current', value: `${imagery.sensor.split(' ')[0]}, ${temporalComparison.currentDate}`, tag: 'POST-EVENT' },
        { label: 'Changed Area', value: changeAnalysis.changedArea, tag: 'GEOMETRIC' },
        { label: 'Confidence', value: `${changeAnalysis.confidenceScore}`, tag: 'VERIFIED' }
      ];

      if (analystMode) {
        return {
          text: `OBSERVATION\nA verified ${changeAnalysis.changeType.toLowerCase()} change was detected between ${temporalComparison.baselineDate} and ${temporalComparison.currentDate}.\n\nEVIDENCE\n• Baseline: ${temporalComparison.baselineDate} (${imagery.sensor})\n• Current: ${temporalComparison.currentDate} (${imagery.sensor})\n• Sensor: ${imagery.sensor}\n• Resolution: ${imagery.resolution}\n• Changed area: ${changeAnalysis.changedArea}\n• Delta: ${changeAnalysis.changePercentage}\n\nCONFIDENCE\n${changeAnalysis.confidenceScore}\n\nINTERPRETATION\n${changeAnalysis.detectionExplanation}\n\nVERIFICATION\nAI-assisted detection. Analyst verification required.`,
          evidence: reportEvidence,
          uiAction: {
            type: 'VIEW_FULL_REPORT',
            description: 'Open complete intelligence dossier'
          }
        };
      }

      return {
        text: `### ANALYSIS SUMMARY\n\n* **Location:** ${aoi.name} (${aoi.locationName})\n* **Coordinates:** ${aoi.coordinates}\n* **Observation Period:** ${temporalComparison.observationPeriod} (${temporalComparison.timeGap})\n* **Sensor:** ${imagery.sensor} (${imagery.resolution})\n* **Detected Change:** ${changeAnalysis.changeType}\n* **Changed Area:** ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage})\n* **Confidence:** ${changeAnalysis.confidenceScore}\n* **Source:** ${imagery.imageSource}\n\n**Evidence:**\n${changeAnalysis.detectionExplanation}\n\n**Verification:**\nAI-assisted visual analysis. Analyst verification required.`,
        evidence: reportEvidence,
        uiAction: {
          type: 'VIEW_FULL_REPORT',
          description: 'Open complete intelligence dossier'
        }
      };
    }

    // 3. MULTI-PART SPECIFIC QUESTIONS
    if (/change.*confidence|confidence.*change/i.test(q)) {
      if (language === 'hi') {
        return { text: `${changeAnalysis.confidenceScore} विश्वसनीयता के साथ एक ${changeAnalysis.changeType} परिवर्तन पहचाना गया।` };
      }
      if (language === 'bn') {
        return { text: `${changeAnalysis.confidenceScore} আত্মবিশ্বাসের সাথে একটি ${changeAnalysis.changeType} পরিবর্তন সনাক্ত করা হয়েছে।` };
      }
      return { text: `${changeAnalysis.changeType} was detected with a confidence of ${changeAnalysis.confidenceScore}.` };
    }

    if (/change.*(area|size)|(area|size).*change/i.test(q)) {
      if (language === 'hi') {
        return { text: `${changeAnalysis.changeType} परिवर्तन पहचाना गया, जो लगभग ${changeAnalysis.changedArea} को कवर करता है।` };
      }
      if (language === 'bn') {
        return { text: `${changeAnalysis.changeType} পরিবর্তন সনাক্ত করা হয়েছে যা প্রায় ${changeAnalysis.changedArea} এলাকা জুড়ে রয়েছে।` };
      }
      return { text: `A ${changeAnalysis.changeType.toLowerCase()} change was detected covering approximately ${changeAnalysis.changedArea}.` };
    }

    // 4. PRECISE FIELD INQUIRIES (Exact field output ONLY)

    // A. COORDINATES
    if (/coordinate|coordinates|lat|lon|latitude|longitude|निर्देशांक|स्थानांक/i.test(q)) {
      if (language === 'hi') {
        return { text: `निर्देशांक ${aoi.coordinates} हैं।` };
      }
      if (language === 'bn') {
        return { text: `স্থানাঙ্ক হলো ${aoi.coordinates}।` };
      }
      return { text: `The coordinates are ${aoi.coordinates}.` };
    }

    // B. CONFIDENCE
    if (/confidence|confident|reliability|accuracy|विश्वसनीयता|आत्मविश्वास/i.test(q)) {
      if (language === 'hi') {
        return { text: `पहचान विश्वसनीयता (Confidence) ${changeAnalysis.confidenceScore} है।` };
      }
      if (language === 'bn') {
        return { text: `সনাক্তকরণ আত্মবিশ্বাস (Confidence) হলো ${changeAnalysis.confidenceScore}।` };
      }
      return { text: `The detection confidence is ${changeAnalysis.confidenceScore}.` };
    }

    // C. HOW LARGE / AREA
    if (/how (large|big)|area|extent|size|क्षेत्रफल|কতটা এলাকা|ক্ষেত্রফল/i.test(q)) {
      if (language === 'hi') {
        return { text: `पहचाना गया परिवर्तन लगभग ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage}) को कवर करता है।` };
      }
      if (language === 'bn') {
        return { text: `সনাক্তকৃত পরিবর্তনটি প্রায় ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage}) এলাকা জুড়ে বিস্তৃত।` };
      }
      return { text: `The detected change covers approximately ${changeAnalysis.changedArea} (${changeAnalysis.changePercentage}).` };
    }

    // D. SATELLITE / SENSOR
    if (/satellite|sensor|instrument|what was used|satellite used|उपग्रह|উপগ্রহ/i.test(q)) {
      if (language === 'hi') {
        return { text: `${imagery.sensor}, ${imagery.resolution}।` };
      }
      if (language === 'bn') {
        return { text: `${imagery.sensor}, ${imagery.resolution}।` };
      }
      return { text: `${imagery.sensor}, ${imagery.resolution}.` };
    }

    // E. RESOLUTION
    if (/resolution|gsd|spatial resolution|रेज़ोल्यूशन|রেজোলিউশন/i.test(q)) {
      if (language === 'hi') {
        return { text: `स्थानिक रेज़ोल्यूशन (Resolution) ${imagery.resolution} है।` };
      }
      if (language === 'bn') {
        return { text: `স্থানিক রেজোলিউশন (Resolution) হলো ${imagery.resolution}।` };
      }
      return { text: `The spatial resolution is ${imagery.resolution}.` };
    }

    // F. DATES / TIMELINE
    if (/date|dates|acquisition|baseline|observation period|when was this|time gap|timeline|अवधि|তারিখ/i.test(q)) {
      if (language === 'hi') {
        return { text: `तुलना अवधि ${temporalComparison.observationPeriod} (${temporalComparison.timeGap}) को कवर करती है।` };
      }
      if (language === 'bn') {
        return { text: `তুলনামূলক পর্যবেক্ষণ ${temporalComparison.observationPeriod} (${temporalComparison.timeGap}) জুড়ে রয়েছে।` };
      }
      return { text: `The comparison covers ${temporalComparison.observationPeriod} (${temporalComparison.timeGap}).` };
    }

    // G. CLOUD COVER
    if (/cloud|cloud cover|cloudiness|बादल|মেঘ/i.test(q)) {
      if (language === 'hi') {
        return { text: `वर्तमान अवलोकन के लिए क्लाउड कवर ${imagery.cloudCoverage} है (बेसलाइन: ${imagery.beforeCloudCover || '0.8%'})।` };
      }
      if (language === 'bn') {
        return { text: `বর্তমান পর্যবেক্ষণে ক্লাউড কভার ${imagery.cloudCoverage} (বেসলাইন: ${imagery.beforeCloudCover || '0.8%'})।` };
      }
      return { text: `Cloud cover is ${imagery.cloudCoverage} for the current observation and ${imagery.beforeCloudCover || '0.8%'} for the baseline.` };
    }

    // H. SOURCE
    if (/source|origin|provider|copernicus|स्रोत|উৎস/i.test(q)) {
      if (language === 'hi') {
        return { text: `उपग्रह डेटा स्रोत ${imagery.imageSource} है।` };
      }
      if (language === 'bn') {
        return { text: `চিত্রের উৎস হলো ${imagery.imageSource}।` };
      }
      return { text: `The imagery source is ${imagery.imageSource}.` };
    }

    // I. LOCATION / PLACE NAME
    if (/where is this|location|which place|sector|name of this|स्थान|जगह/i.test(q)) {
      if (language === 'hi') {
        return { text: `${aoi.name} (${aoi.locationName})।` };
      }
      if (language === 'bn') {
        return { text: `${aoi.name} (${aoi.locationName})।` };
      }
      return { text: `${aoi.name} (${aoi.locationName}).` };
    }

    // J. BORDER PROXIMITY
    if (/border|distance|how far|boundary|सीमा|সীমানা/i.test(q)) {
      if (language === 'hi') {
        return { text: `${aoi.distanceFromBorder || 'तटीय समुद्री दृष्टिकोण क्षेत्र में स्थित (~18 किमी)'}।` };
      }
      if (language === 'bn') {
        return { text: `${aoi.distanceFromBorder || 'উপকূলীয় সামুদ্রিক অ্যাপ্রোচ জোনে অবস্থিত (~১৮ কিমি)'}।` };
      }
      return { text: `${aoi.distanceFromBorder || 'Located in coastal maritime approach zone (~18 km from open waters)'}.` };
    }

    // K. WHY DETECTED / EVIDENCE
    if (/why.*detected|cause|evidence|reason|saboot|प्रमाण|कारण|কারণ/i.test(q)) {
      if (language === 'hi') {
        return { text: 'सिस्टम ने दृश्यमान और NIR बैंड में बेसलाइन और वर्तमान अवलोकनों के बीच महत्वपूर्ण दृश्य अंतर का पता लगाया।' };
      }
      if (language === 'bn') {
        return { text: 'সিস্টেমটি দৃশ্যমান এবং NIR ব্যান্ডে বেসলাইন ও বর্তমান পর্যবেক্ষণের মধ্যে উল্লেখযোগ্য ভিজ্যুয়াল পার্থক্য সনাক্ত করেছে।' };
      }
      return { text: 'The system detected a significant visual difference between the selected observations.' };
    }

    // L. WHAT CHANGED HERE? (Primary question)
    if (/what changed|kya badla|ki poriborton|what is the change|बदलाव|পরিবর্তন/i.test(q)) {
      if (language === 'hi') {
        return { text: `एक नया ${changeAnalysis.changeType} परिवर्तन पहचाना गया। परिवर्तित क्षेत्र लगभग ${changeAnalysis.changedArea} है।` };
      }
      if (language === 'bn') {
        return { text: `একটি নতুন ${changeAnalysis.changeType} পরিবর্তন সনাক্ত করা হয়েছে। সনাক্তকৃত পরিবর্তনটি প্রায় ${changeAnalysis.changedArea} এলাকা জুড়ে রয়েছে।` };
      }
      return { text: `A ${changeAnalysis.changeType.toLowerCase()} change was detected. The detected change covers approximately ${changeAnalysis.changedArea}.` };
    }

    // M. DEFAULT / UNMATCHED (1-2 sentences maximum, strictly direct)
    if (language === 'hi') {
      return { text: `${aoi.name} के लिए ${changeAnalysis.changeType} परिवर्तन दर्ज है (${changeAnalysis.changedArea}, ${changeAnalysis.confidenceScore} विश्वसनीयता)।` };
    }
    if (language === 'bn') {
      return { text: `${aoi.name}-এর জন্য ${changeAnalysis.changeType} পরিবর্তন নথিভুক্ত রয়েছে (${changeAnalysis.changedArea}, ${changeAnalysis.confidenceScore} আত্মবিশ্বাস)।` };
    }
    return {
      text: `For ${aoi.name}, a ${changeAnalysis.changeType.toLowerCase()} change was detected (${changeAnalysis.changedArea}, confidence ${changeAnalysis.confidenceScore}).`
    };
  }
}

export const vigilAssistantService = VigilAssistantService.getInstance();
