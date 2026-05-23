import QRCode from "qrcode";
import { IDocument, IsExtensionInstalled } from "./bpac.js";

const APP_URL = "https://www.qrwegn.com";
const TEMPLATE_PATH = "C:\\qrwegn-print-server\\qrwegn-template.lbx";

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

function getQrUrl(businessSlug, table, index) {
  const tableValue =
    table?.slug ||
    table?.table_slug ||
    table?.id ||
    table?.table_number ||
    table?.tableNumber ||
    index + 1;

  return `${APP_URL}/scan/${businessSlug}/${tableValue}`;
}

export async function printBrotherLabels({ businessSlug, tables }) {
  if (!IsExtensionInstalled()) {
    alert(
      "Brother b-PAC extension is not detected.\n\n" +
        "1. Install the Brother b-PAC Extension in Microsoft Edge.\n" +
        "2. Install the Brother b-PAC Client Component.\n" +
        "3. Reload this page in Edge."
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
      const tableName = getTableName(table, i);
      const qrUrl = getQrUrl(businessSlug, table, i);

      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        margin: 1,
        width: 500,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const tableObj = await IDocument.GetObject("tableName");
      const qrObj = await IDocument.GetObject("qrCode");

      if (!tableObj) {
        throw new Error("Template object 'tableName' not found in .lbx file");
      }

      if (!qrObj) {
        throw new Error("Template object 'qrCode' not found in .lbx file");
      }

      tableObj.Text = tableName;
      await qrObj.SetData(0, qrDataUrl, 4);

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