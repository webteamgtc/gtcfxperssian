const Metatrader5 = require("mt5-sdk");

const DEFAULT_GROUP = "demo\\web.hedged";

const mt5Instance = new Metatrader5("apid.gtc-servers.com", 443, {
  login: 2001,
  password: "API*r0mKzEw",
  build: 5430,
  agent: "WebManager",
});

function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function mt5ErrorMessage(parsed, fallback) {
  if (!parsed) return fallback;
  const retcode = parsed.retcode ?? parsed.Retcode;
  const description =
    parsed.description ??
    parsed.Description ??
    parsed.message ??
    parsed.Message ??
    parsed.answer;
  if (retcode != null && description) return `${retcode}: ${description}`;
  if (retcode != null) return String(retcode);
  return fallback;
}

/**
 * MT5 SDK parseBodyJSON() returns null on non-zero retcode, discarding the
 * actual error. This wrapper keeps the raw parsed body for diagnostics.
 */
function mt5Post(path, payload) {
  return new Promise((resolve, reject) => {
    const run = (authError) => {
      if (authError) {
        reject(authError);
        return;
      }

      mt5Instance.http.post(path, JSON.stringify(payload), (error, res, body) => {
        if (error) {
          reject(error);
          return;
        }

        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          resolve({
            ok: false,
            statusCode: res?.statusCode,
            parsed: null,
            rawBody: body,
            answer: null,
          });
          return;
        }

        const retcode = Number.parseInt(String(parsed?.retcode ?? ""), 10);
        resolve({
          ok: Number.isFinite(retcode) ? retcode === 0 : res?.statusCode === 200,
          statusCode: res?.statusCode,
          parsed,
          rawBody: body,
          answer: parsed?.answer ?? null,
        });
      });
    };

    mt5Instance.auth.auth(run);
  });
}

function extractClientId(clientResponse) {
  if (!clientResponse) return null;

  if (Array.isArray(clientResponse)) {
    const first = clientResponse[0];
    return first?.id ?? first?.RecordID ?? first?.record_id ?? null;
  }

  return clientResponse?.id ?? clientResponse?.RecordID ?? clientResponse?.record_id ?? null;
}

function extractUserLogin(userResponse) {
  if (!userResponse) return null;

  if (Array.isArray(userResponse)) {
    const first = userResponse[0];
    return first?.Login ?? first?.login ?? null;
  }

  return userResponse?.Login ?? userResponse?.login ?? null;
}

async function clientPipeline(credentials) {
  const group = credentials.group || DEFAULT_GROUP;
  const phone = sanitizePhone(credentials.phone);
  const email = String(credentials.email || "").trim().toLowerCase();
  const firstName = String(credentials.first_name || "").trim();

  if (!firstName || !email || !phone) {
    return {
      success: false,
      message: "Missing required fields: first_name, email, or phone",
    };
  }

  try {
    const existingUsers = await mt5Instance.users.getBatch(DEFAULT_GROUP);
    const usersList = existingUsers?.answer ?? [];

    if (
      Array.isArray(usersList) &&
      usersList.some(
        (user) =>
          String(user?.Email ?? user?.email ?? "").toLowerCase() === email
      )
    ) {
      return { success: false, message: "Email already exist" };
    }

    const newClient = {
      PersonName: firstName,
      ContactPhone: phone,
      ContactEmail: email,
      ClientType: "1",
    };

    // MT5 Web API expects a JSON array for /api/client/add.
    const clientResult = await mt5Post("/api/client/add", [newClient]);
    const clientResponse = clientResult.answer;
    console.log(clientResponse,"clientResponse");
    console.log(clientResult,"clientResult");

    const client_id = extractClientId(clientResponse);
    if (!client_id) {
      return {
        success: false,
        message:
          mt5ErrorMessage(clientResult.parsed, "Client create failed") ||
          "Client create failed",
        debug: {
          statusCode: clientResult.statusCode,
          retcode: clientResult.parsed?.retcode,
        },
      };
    }

    const userPayload = {
      Login: 0,
      PassMain: credentials.password,
      PassInvestor: credentials.invest_password,
      Rights: 0,
      Group: group,
      Name: firstName,
      FirstName: firstName,
      LastName: "",
      Company: credentials.company || "",
      Language: 9,
      Country: credentials.country || "",
      Phone: phone,
      Email: email,
      Status: 1,
      Comment: "New account created by Web API",
      Leverage: 500,
      Agent: 0,
    };

    const userResult = await mt5Post("/api/user/add", userPayload);
    const userResponse = userResult.answer;
    const userLogin = extractUserLogin(userResponse);

    if (!userLogin) {
      return {
        success: false,
        message:
          mt5ErrorMessage(userResult.parsed, "Something went wrong while adding the user. Try again!") ||
          "Something went wrong while adding the user. Try again!",
        debug: {
          statusCode: userResult.statusCode,
          retcode: userResult.parsed?.retcode,
        },
      };
    }

    const bindPayload = [{ user: userLogin, client: client_id }];
    const bindResult = await mt5Instance.clients.addUser(bindPayload);

    return {
      success: true,
      message: "Client and user added and bound successfully",
      user: userLogin,
      bindResult,
    };
  } catch (error) {
    console.error("[mt5-server] clientPipeline error:", error);
    return {
      success: false,
      message: error?.message || "MT5 account creation failed",
    };
  }
}

module.exports = clientPipeline;
