import QRCode from "qrcode";
import { IDocument, IsExtensionInstalled } from "./bpac.js";

const APP_URL = "https://www.qrwegn.com";
const TEMPLATE_PATH = "C:\\qrwegn-print-server\\qrwegn-template.lbx";
const PRINT_SERVER = "http://localhost:5000";

function getBusinessName(table, businessSlug) {
  return (
    table?.business_name ||
    table?.restaurant_name ||
    table?.businessName ||
    table?.business?.name ||
    businessSlug
  );
}

function getTableName(table, index) {
  return (
    table?.table_name ||
    table?.name ||
    table?.label ||
    table?.tableNumber ||
    table?.table_number ||
    `Table ${index + 1}`
  );
}

function getTableValue(table, index) {
  return (
    table?.slug ||
    table?.table_slug ||
    table?.id ||
    table?.table_number ||
    table?.tableNumber ||
    index + 1
  );
}

function getQrUrl(businessSlug, table, index) {
  const tableValue = getTableValue(table, index);
  return `${APP_URL}/scan/${businessSlug}/${encodeURIComponent(tableValue)}`;
}

async function savePngViaServer(base64) {
  const resp = await fetch(`${PRINT_SERVER}/save-qr-png`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64 }),
  });
  if (!resp.ok) throw new Error(`Print server error ${resp.status} — is node server.js running?`);
  const { filePath } = await resp.json();
  return filePath;
}

export async function printBrotherLabels({ businessSlug, tables }) {
  if (!IsExtensionInstalled()) {
    alert(
      "Brother b-PAC extension is not detected.\n\n" +
        "1. Open this page in Microsoft Edge.\n" +
        "2. Make sure the Brother b-PAC Extension is installed and enabled.\n" +
        "3. Hard refresh with Ctrl + Shift + R."
    );
    return;
  }

  if (!businessSlug) {
    alert("Missing business slug.");
    return;
  }

  if (!tables || tables.length === 0) {
    alert("No tables found to print.");
    return;
  }

  const opened = await IDocument.Open(TEMPLATE_PATH);

  if (!opened) {
    alert(
      `Could not open Brother label template:\n${TEMPLATE_PATH}\n\nMake sure the .lbx file exists at that path.`
    );
    return;
  }

  try {
    await IDocument.StartPrint("QR-Wegn Labels", 0);

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      const businessName = getBusinessName(table, businessSlug);
      const tableName = getTableName(table, i);
      const qrUrl = getQrUrl(businessSlug, table, i);

      console.log("[Brother] Printing label:", { businessName, tableName, qrUrl });

      const businessObj = await IDocument.GetObject("businessName");
      const tableObj = await IDocument.GetObject("tableName");
      const qrObj = await IDocument.GetObject("qrCode");

      if (!businessObj) throw new Error("Template object 'businessName' not found");
      if (!tableObj) throw new Error("Template object 'tableName' not found");
      if (!qrObj) throw new Error(
        "Template object 'qrCode' not found.\n\n" +
        "Open qrwegn-template.lbx in P-touch Editor, delete the QR barcode object, " +
        "insert an Image placeholder in its place, and name it 'qrCode'."
      );

      businessObj.Text = businessName;
      tableObj.Text = tableName;

      // Generate QR as PNG, write to disk via print server, inject into image object.
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      const filePath = await savePngViaServer(base64);

      console.log("[Brother] PNG written to:", filePath);

      const result = await qrObj.SetData(1, filePath, 0);
      console.log("[Brother] SetData(1, filePath, 0):", result);

      if (!result) {
        throw new Error(
          "SetData returned false for 'qrCode' object.\n\n" +
          "Make sure 'qrCode' is an IMAGE object (not barcode) in the template."
        );
      }

      await IDocument.PrintOut(1, 0);
    }

    await IDocument.EndPrint();
    await IDocument.Close();

    alert(`${tables.length} label(s) sent to Brother printer.`);
  } catch (error) {
    console.error("Brother print error:", error);

    try {
      await IDocument.Close();
    } catch (_) {}

    alert(`Brother print failed:\n${error.message || error}`);
  }
}
