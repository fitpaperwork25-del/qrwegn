export async function printBrotherLabels({ businessSlug, tables }) {
  if (!window.bpac) {
    alert("Brother b-PAC is not loaded. Use Windows + Edge/Internet Explorer mode.");
    return;
  }

  const templatePath = "C:\\qrwegn-print-server\\qrwegn-template.lbx";
  const doc = new window.bpac.Document();

  const opened = await doc.Open(templatePath);

  if (!opened) {
    alert("Could not open qrwegn-template.lbx");
    return;
  }

  try {
    doc.StartPrint("", 0);

    for (const table of tables) {
      const tableName = table.name || `Table ${table.table_number || table.id}`;
      const qrUrl = `https://qrwegn.com/scan/${businessSlug}/${table.id}`;

      doc.GetObject("tableName").Text = tableName;
      doc.GetObject("qrCode").Text = qrUrl;

      doc.PrintOut(1, 0);
    }

    doc.EndPrint();
    alert("Labels sent to Brother printer.");
  } catch (error) {
    console.error(error);
    alert("Brother printing failed.");
  } finally {
    doc.Close();
  }
}