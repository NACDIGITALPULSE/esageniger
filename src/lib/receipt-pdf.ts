import jsPDF from "jspdf";
import logoUrl from "@/assets/esage-logo.jpg";

export type ReceiptData = {
  receipt_number: string;
  full_name: string;
  phone: string;
  email: string;
  program_title?: string | null;
  program_level?: string | null;
  tuition_title?: string | null;
  tuition_price?: string | null;
  message?: string | null;
  created_at: string;
  status?: string | null;
};

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateReceiptPDF(data: ReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;

  // Header band
  doc.setFillColor(15, 36, 71); // primary navy
  doc.rect(0, 0, pageW, 110, "F");

  // Logo
  const logo = await loadImageAsDataUrl(logoUrl);
  if (logo) {
    try {
      doc.addImage(logo, "JPEG", margin, 24, 64, 64);
    } catch {
      // ignore
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ESAGE", margin + 80, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("École Supérieure d'Administration et de Gestion d'Entreprise", margin + 80, 68);
  doc.text("Niamey, Niger — 2ème rond-point Wadata, route Filingué", margin + 80, 82);

  // Title
  doc.setTextColor(15, 36, 71);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REÇU D'INSCRIPTION", margin, 150);

  // Receipt info box
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, 170, pageW - margin * 2, 70, 6, 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("N° de reçu :", margin + 16, 192);
  doc.text("Date :", margin + 16, 212);
  doc.text("Statut :", margin + 16, 232);
  doc.setFont("helvetica", "normal");
  doc.text(data.receipt_number, margin + 110, 192);
  doc.text(new Date(data.created_at).toLocaleString("fr-FR"), margin + 110, 212);
  doc.text(data.status === "approved" ? "Validée" : data.status === "rejected" ? "Refusée" : "En attente", margin + 110, 232);

  // Candidate
  let y = 280;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Informations du candidat", margin, y);
  doc.setDrawColor(200);
  doc.line(margin, y + 4, pageW - margin, y + 4);
  y += 24;

  const rows: Array<[string, string]> = [
    ["Nom complet", data.full_name],
    ["Téléphone", data.phone],
    ["Email", data.email],
  ];
  doc.setFontSize(10);
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k} :`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, margin + 110, y);
    y += 18;
  }

  // Programme
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Formation choisie", margin, y);
  doc.line(margin, y + 4, pageW - margin, y + 4);
  y += 24;

  const progRows: Array<[string, string]> = [
    ["Filière", data.program_title || "—"],
    ["Niveau", data.program_level || "—"],
    ["Palier de frais", data.tuition_title || "—"],
    ["Montant", data.tuition_price ? `${data.tuition_price} FCFA` : "—"],
  ];
  doc.setFontSize(10);
  for (const [k, v] of progRows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k} :`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, margin + 110, y);
    y += 18;
  }

  if (data.message) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Message du candidat", margin, y);
    doc.line(margin, y + 4, pageW - margin, y + 4);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(data.message, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 80;
  doc.setDrawColor(15, 36, 71);
  doc.setLineWidth(1);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Conservez ce reçu — il atteste de votre demande d'inscription auprès d'ESAGE.", margin, footerY + 18);
  doc.text("Pour toute question : +227 96 87 67 17 — esageniger@gmail.com", margin, footerY + 34);
  doc.setFont("helvetica", "italic");
  doc.text("Document généré automatiquement par ESAGE", margin, footerY + 50);

  return doc;
}

export async function downloadReceipt(data: ReceiptData) {
  const doc = await generateReceiptPDF(data);
  doc.save(`recu-${data.receipt_number}.pdf`);
}
