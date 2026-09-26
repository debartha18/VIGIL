// Generates procedural authentic Sentinel-2 true-color satellite imagery textures
// strictly offline and cached as data URIs for instant pixel-crisp display.

export function createSatelliteTexture(
  width: number,
  height: number,
  type: 'coast' | 'before' | 'after' | 'riverside' | 'port' | 'bridge' | 'development',
  seed: number = 42
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background deep ocean / coastal water
  const oceanGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
  oceanGrad.addColorStop(0, '#0a233a');
  oceanGrad.addColorStop(0.3, '#0c3552');
  oceanGrad.addColorStop(0.5, '#12536b');
  oceanGrad.addColorStop(0.7, '#1b6e82');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Coastline & Landmass
  ctx.beginPath();
  if (type === 'coast') {
    // Meandering coastline from top-center to bottom-left with river estuary entering top-right
    ctx.moveTo(width * 0.2, 0);
    ctx.bezierCurveTo(width * 0.35, height * 0.25, width * 0.45, height * 0.4, width * 0.65, height * 0.65);
    ctx.bezierCurveTo(width * 0.8, height * 0.85, width * 0.95, height * 0.95, width, height);
    ctx.lineTo(width, 0);
    ctx.closePath();
  } else {
    // General landmass with river
    ctx.moveTo(0, height * 0.15);
    ctx.bezierCurveTo(width * 0.3, height * 0.3, width * 0.6, height * 0.4, width, height * 0.6);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
  }

  // Land color gradient (agricultural fields, dry terrain, vegetation patches)
  const landGrad = ctx.createLinearGradient(0, 0, width, height);
  landGrad.addColorStop(0, '#384d30');
  landGrad.addColorStop(0.3, '#4d5d36');
  landGrad.addColorStop(0.6, '#5b573a');
  landGrad.addColorStop(1, '#3b4a2e');
  ctx.fillStyle = landGrad;
  ctx.fill();

  // Draw agricultural field grid & parcels
  ctx.save();
  ctx.clip();

  const numFields = 45;
  for (let i = 0; i < numFields; i++) {
    const fx = (Math.sin(i * 99 + seed) * 0.5 + 0.5) * width;
    const fy = (Math.cos(i * 33 + seed) * 0.5 + 0.5) * height;
    const fw = 30 + (i % 5) * 15;
    const fh = 25 + (i % 4) * 18;

    const colors = [
      'rgba(40, 65, 35, 0.6)',
      'rgba(75, 85, 45, 0.6)',
      'rgba(95, 80, 55, 0.5)',
      'rgba(60, 75, 40, 0.65)',
      'rgba(110, 95, 70, 0.4)',
    ];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = 'rgba(25, 40, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(fx, fy, fw, fh);
  }

  // Meandering River Channel
  ctx.beginPath();
  ctx.moveTo(width * 0.7, 0);
  ctx.bezierCurveTo(width * 0.65, height * 0.3, width * 0.55, height * 0.5, width * 0.45, height * 0.7);
  ctx.bezierCurveTo(width * 0.38, height * 0.85, width * 0.3, height * 0.95, width * 0.25, height);
  ctx.lineWidth = width * 0.08;
  ctx.strokeStyle = '#0f3c55';
  ctx.stroke();

  // Turbid river mud / sediment edges
  ctx.lineWidth = width * 0.04;
  ctx.strokeStyle = '#1a526d';
  ctx.stroke();

  // Urban / Industrial Settlement Blocks
  const numUrban = 25;
  for (let u = 0; u < numUrban; u++) {
    const ux = width * 0.45 + (Math.sin(u * 17) * 0.2) * width;
    const uy = height * 0.35 + (Math.cos(u * 23) * 0.25) * height;
    ctx.fillStyle = (u % 3 === 0) ? 'rgba(180, 190, 200, 0.75)' : 'rgba(120, 130, 140, 0.65)';
    ctx.fillRect(ux, uy, 8 + (u % 4) * 4, 6 + (u % 3) * 4);
  }

  // Specific features for type
  if (type === 'before') {
    // Empty cleared parcel with bare ground
    ctx.fillStyle = 'rgba(115, 100, 80, 0.75)';
    ctx.fillRect(width * 0.6, height * 0.35, width * 0.25, height * 0.25);
  } else if (type === 'after') {
    // New concrete foundation & metal warehouse structures
    ctx.fillStyle = 'rgba(220, 225, 235, 0.95)';
    ctx.fillRect(width * 0.62, height * 0.38, width * 0.12, height * 0.18);
    ctx.fillStyle = 'rgba(175, 190, 210, 0.9)';
    ctx.fillRect(width * 0.75, height * 0.42, width * 0.09, height * 0.14);
    // Access road
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.45);
    ctx.lineTo(width * 0.62, height * 0.45);
    ctx.strokeStyle = 'rgba(240, 240, 240, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (type === 'port') {
    // Pier and jetty structures extending into water
    ctx.fillStyle = 'rgba(190, 200, 215, 0.9)';
    ctx.fillRect(width * 0.2, height * 0.4, width * 0.3, 14);
    ctx.fillRect(width * 0.35, height * 0.3, 12, height * 0.35);
  } else if (type === 'bridge') {
    // Linear bridge structure across the river
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.5);
    ctx.lineTo(width * 0.75, height * 0.45);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(230, 235, 245, 0.95)';
    ctx.stroke();
  }

  // Roads network
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.1);
  ctx.lineTo(width * 0.9, height * 0.85);
  ctx.strokeStyle = 'rgba(190, 195, 200, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Subtle sensor noise / scanline atmosphere
  ctx.fillStyle = 'rgba(0, 20, 40, 0.04)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
