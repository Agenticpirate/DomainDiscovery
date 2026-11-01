/**
 * Sends domainsdiscovery.com traffic to the deployed site Worker.
 * The site lives on the other Cloudflare account, so this fetches its
 * workers.dev URL instead of the public hostname (that would loop).
 */

export interface Env {
  ORIGIN_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url);
    const target = new URL(env.ORIGIN_URL);
    target.pathname = incoming.pathname;
    target.search = incoming.search;

    const headers = new Headers(request.headers);
    headers.set("host", target.host);

    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    const outgoing = new Headers(response.headers);
    const location = outgoing.get("location");
    if (location) {
      const redirected = new URL(location, target);
      if (redirected.host === target.host) {
        redirected.protocol = incoming.protocol;
        redirected.host = incoming.host;
        outgoing.set("location", `${redirected.pathname}${redirected.search}${redirected.hash}`);
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outgoing,
    });
  },
};
