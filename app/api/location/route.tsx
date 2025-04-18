export async function GET() {
  try {
    const res = await fetch("https://geolocation-db.com/json/");

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch location" }), { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: err }), {
      status: 500,
    });
  }
}
