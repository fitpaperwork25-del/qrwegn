export async function printAllQRCodes(businessSlug, tables) {
  try {
    const response = await fetch("http://localhost:5000/generate-labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessSlug, tables }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Batch printing complete.");
    } else {
      alert("Printing failed: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Could not reach print server. Make sure it's running on port 5000.");
  }
}