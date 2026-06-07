import { Resend } from 'resend'

let _client: Resend | undefined
function getClient() {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY!)
  return _client
}

export async function sendPurchaseEmail(
  to: string,
  planTitle: string,
  downloadLinks: { label: string; url: string }[]
) {
  const linkRows = downloadLinks
    .map(
      ({ label, url }) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a1f16;">
            <a href="${url}" style="color:#d4af37;font-family:Georgia,serif;font-size:15px;text-decoration:none;">
              Download ${label} &rarr;
            </a>
          </td>
        </tr>`
    )
    .join('')

  await getClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Your floor plan files — ${planTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#1a1008;font-family:Georgia,serif;color:#e8d5b0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:48px 24px;">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#231508;border:1px solid #3a2a1e;border-radius:4px;">
                  <tr>
                    <td style="padding:40px 48px 24px;">
                      <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;">
                        Your Purchase
                      </p>
                      <h1 style="margin:0 0 24px;font-size:28px;color:#f5ead8;font-weight:400;">
                        ${planTitle}
                      </h1>
                      <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#c4a882;">
                        Thank you for your purchase. Your floor plan files are ready to download below.
                        These links expire in 24 hours — you can always access fresh download links from
                        your orders page.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${linkRows}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 48px 40px;border-top:1px solid #2a1f16;">
                      <p style="margin:0;font-size:12px;color:#7a6a56;">
                        Questions? Reply to this email and we'll be happy to help.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}
