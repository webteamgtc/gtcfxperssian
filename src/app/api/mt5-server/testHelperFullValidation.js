const Metatrader5 = require("mt5-sdk");
const axios = require("axios");

const group = "demo\\web.hedged";


const mt5Instance = new Metatrader5("mtapi.gtcfx.com", 443, {
    login: 5550, //// this one
    password: "API-l6zBqIz",
    build: 4380,
    agent: "WebManager",
   });


async function clientPipeline(credentials) {
    // Create Client
    const newClient = {
        PersonName: credentials.first_name,
        ContactPhone: credentials.phone,
        ContactEmail: credentials.email,
        ClientType: "1",
    };

    const client = await mt5Instance.clients.create(newClient);

    console.log("client", { client })


    if (!client?.[0]?.id) {
        return {
            message: client?.[0]?.retcode,
            success: false
        }
    }

    const client_id = client[0].id;
    // Add User

    console.log("ccc", { client,credentials })

    const user = await mt5Instance.users.create({
        Login: 0, // assuming server allocates a login automatically
        PassMain: credentials.password,
        PassInvestor: credentials.password,
        Rights: 0,
        Group: credentials.group,
        Name: credentials.first_name,
        FirstName: credentials.first_name,
        LastName: "", // Adjust accordingly
        Company: credentials.company,
        Language: "9", // Language code for English
        City: "",
        State: "",
        Zipcode: "",
        Address: "",
        Country: credentials.country,
        Phone: credentials.phone,
        Email: credentials.email,
        ID: 0, // placeholder, replace with actual ID if needed
        Status: 1,
        Comment: "",
        Color: 0,
        PhonePassword: credentials.password,
        Leverage: 500,
        Agent: 0,
    });

    console.log("ccc", { user })

    if (!user?.Login) {
        return {
            message: "Something went wrong while adding user try again!",
            success: false
        }
    }
    // Bind the user account to the client
    const bindBody = [{ user: user.Login, client: client_id }];

    const bindUser = await mt5Instance.clients.addUser(bindBody);

    const zappierData = {
        first_name: credentials.first_name,
        phone: credentials.phone,
        email: credentials.email,
        company: credentials.company,
        country: credentials.country,
        client_id: client_id,
        user_login: user.Login,
        password: credentials.password,
        // ip_address: req.ip, // Get the IP address of the client
    };

    const zappier = await axios.post(
        "https://hooks.zapier.com/hooks/catch/16420445/2bfgi0j/",
        zappierData
    );

    return {
        message: "Client and user added and bound successfully",
        success: true,
        user: user?.Login
    }

}


export default clientPipeline



// const Metatrader5 = require("mt5-sdk");
// const axios = require("axios");

// const mt5Instance = new Metatrader5("apid.gtc-servers.com", 443, {
//   login: 2001,
//   password: "*r0mKzEw",
//   build: 5340,
//   agent: "WebManager",
// });

// async function clientPipeline(credentials) {
//   try {
//     // Validate credentials
//     if (!credentials?.first_name || !credentials?.email || !credentials?.phone) {
//       return {
//         message: "Missing required fields: first_name, email, or phone",
//         success: false,
//       };
//     }

//     // Check if email already exists
//     let getUSer;
//     try {
//       getUSer = await mt5Instance.users.getBatch("demo\\web.hedged");
//       if (getUSer?.answer?.some((x) => x?.Email == credentials.email)) {
//         return {
//           message: "Email already exist",
//           success: false,
//         };
//       }
//     } catch (error) {
//       console.error("Error checking existing users:", error);
//       // Continue even if this check fails, as it's not critical
//     }

//     // Create the client - MT5 SDK typically expects an array for batch operations
//     const newClient = {
//       PersonName: credentials.first_name,
//       ContactPhone: credentials.phone,
//       ContactEmail: credentials.email,
//       ClientType: "1",
//     };

//     // Debug: Check if the method exists and what methods are available
//     console.log("MT5 Instance methods:", {
//       hasClients: !!mt5Instance.clients,
//       clientsMethods: mt5Instance.clients ? Object.keys(mt5Instance.clients) : [],
//       newClientData: newClient,
//     });

//     // Try both single object and array format (some SDK versions expect array)
//     let clientResponse;
//     let httpErrorInfo = null; // Store error info outside try block
//     try {
//       // Check if method exists
//       if (!mt5Instance.clients || typeof mt5Instance.clients.create !== 'function') {
//         console.error("clients.create method does not exist!");
//         return {
//           message: "MT5 SDK error: clients.create method not available. Available methods: " + (mt5Instance.clients ? Object.keys(mt5Instance.clients).join(', ') : 'none'),
//           success: false,
//         };
//       }

//       // Intercept HTTP responses to capture actual errors
//       // The SDK swallows errors, so we need to check the HTTP layer
//       const originalPost = mt5Instance.http.post.bind(mt5Instance.http);
//       let capturedError = null;
//       let capturedResponse = null;
//       let capturedBody = null;
      
//       // Temporarily override the post method to capture responses
//       mt5Instance.http.post = function(path, body, callback) {
//         console.log("HTTP POST Request:", { path, body: body.substring(0, 200) });
//         return originalPost(path, body, (error, res, body) => {
//           capturedError = error;
//           capturedResponse = res;
//           capturedBody = body;
//           console.log("HTTP POST Response:", {
//             error: error?.message || error,
//             statusCode: res?.statusCode,
//             statusMessage: res?.statusMessage,
//             headers: res?.headers,
//             body: body?.substring(0, 500), // First 500 chars of body
//           });
//           callback(error, res, body);
//         });
//       };

//       // First try with array format (most common for MT5 SDK)
//       console.log("Attempting client creation with array format:", [newClient]);
//       clientResponse = await mt5Instance.clients.create([newClient]);
//       console.log("Client creation response (array format):", JSON.stringify(clientResponse, null, 2));
//       console.log("Response type:", typeof clientResponse, "Is array:", Array.isArray(clientResponse));
      
//       // If null, check what the HTTP layer returned and store error info
//       if (!clientResponse) {
//         console.error("Client creation returned null. Checking HTTP response...");
//         httpErrorInfo = {
//           statusCode: capturedResponse?.statusCode,
//           statusMessage: capturedResponse?.statusMessage,
//           error: capturedError,
//           body: null,
//           retcode: null,
//           description: null,
//         };
        
//         if (capturedResponse) {
//           console.error("HTTP Status Code:", capturedResponse.statusCode);
//           console.error("HTTP Status Message:", capturedResponse.statusMessage);
//           httpErrorInfo.statusCode = capturedResponse.statusCode;
//           httpErrorInfo.statusMessage = capturedResponse.statusMessage;
//         }
//         if (capturedBody) {
//           try {
//             const parsedBody = JSON.parse(capturedBody);
//             console.error("Parsed HTTP Body:", JSON.stringify(parsedBody, null, 2));
//             httpErrorInfo.body = parsedBody;
//             if (parsedBody.retcode !== undefined) {
//               httpErrorInfo.retcode = parsedBody.retcode;
//               httpErrorInfo.description = parsedBody.description || parsedBody.answer || parsedBody.message || 'No description provided';
//               console.error("MT5 Retcode:", parsedBody.retcode);
//               console.error("MT5 Description:", httpErrorInfo.description);
//             }
//           } catch (e) {
//             console.error("Raw HTTP Body (not JSON):", capturedBody);
//             httpErrorInfo.body = capturedBody;
//           }
//         }
//         if (capturedError) {
//           console.error("HTTP Error:", capturedError);
//           httpErrorInfo.error = capturedError;
//         }
//       }
      
//       // Restore original post method
//       mt5Instance.http.post = originalPost;
      
//       // If null, try single object format
//       if (!clientResponse || (Array.isArray(clientResponse) && clientResponse.length === 0)) {
//         console.log("Array format returned null/empty, trying single object format...");
        
//         // Reset capture variables
//         capturedError = null;
//         capturedResponse = null;
//         capturedBody = null;
        
//         // Override again for second attempt
//         mt5Instance.http.post = function(path, body, callback) {
//           console.log("HTTP POST Request (object format):", { path, body: body.substring(0, 200) });
//           return originalPost(path, body, (error, res, body) => {
//             capturedError = error;
//             capturedResponse = res;
//             capturedBody = body;
//             console.log("HTTP POST Response (object format):", {
//               error: error?.message || error,
//               statusCode: res?.statusCode,
//               statusMessage: res?.statusMessage,
//               body: body?.substring(0, 500),
//             });
//             callback(error, res, body);
//           });
//         };
        
//         console.log("Attempting client creation with object format:", newClient);
//         clientResponse = await mt5Instance.clients.create(newClient);
//         console.log("Client creation response (object format):", JSON.stringify(clientResponse, null, 2));
//         console.log("Response type:", typeof clientResponse, "Is array:", Array.isArray(clientResponse));
        
//         // Check HTTP response again and update error info
//         if (!clientResponse && capturedBody) {
//           httpErrorInfo = {
//             statusCode: capturedResponse?.statusCode,
//             statusMessage: capturedResponse?.statusMessage,
//             error: capturedError,
//             body: null,
//             retcode: null,
//             description: null,
//           };
//           try {
//             const parsedBody = JSON.parse(capturedBody);
//             console.error("Parsed HTTP Body (object format):", JSON.stringify(parsedBody, null, 2));
//             httpErrorInfo.body = parsedBody;
//             if (parsedBody.retcode !== undefined) {
//               httpErrorInfo.retcode = parsedBody.retcode;
//               httpErrorInfo.description = parsedBody.description || parsedBody.answer || parsedBody.message || 'No description provided';
//               console.error("MT5 Retcode:", parsedBody.retcode);
//               console.error("MT5 Description:", httpErrorInfo.description);
//             }
//           } catch (e) {
//             console.error("Raw HTTP Body (object format, not JSON):", capturedBody);
//             httpErrorInfo.body = capturedBody;
//           }
//         }
        
//         // Restore original post method
//         mt5Instance.http.post = originalPost;
//       }
//     } catch (error) {
//       console.error("Error creating client - Full error details:", {
//         message: error?.message,
//         name: error?.name,
//         code: error?.code,
//         stack: error?.stack,
//         error: error,
//         errorString: String(error),
//         errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error)),
//       });
//       return {
//         message: error?.message || error?.toString() || "Failed to create client: Unknown error occurred",
//         success: false,
//         error: error?.stack || error,
//         errorDetails: {
//           name: error?.name,
//           code: error?.code,
//           message: error?.message,
//         },
//       };
//     }

//     // Handle null or undefined response
//     if (!clientResponse) {
//       console.error("Client response is null or undefined. Extracting error from HTTP response...");
      
//       // Build error message from captured HTTP response
//       let errorMessage = "Client creation failed";
      
//       if (httpErrorInfo) {
//         if (httpErrorInfo.statusCode && httpErrorInfo.statusCode !== 200) {
//           errorMessage += `: HTTP ${httpErrorInfo.statusCode} ${httpErrorInfo.statusMessage || ''}`;
//         }
//         if (httpErrorInfo.retcode !== null && httpErrorInfo.retcode !== undefined) {
//           errorMessage += ` (MT5 Retcode: ${httpErrorInfo.retcode})`;
//         }
//         if (httpErrorInfo.description) {
//           errorMessage += ` - ${httpErrorInfo.description}`;
//         } else if (httpErrorInfo.statusCode && httpErrorInfo.statusCode !== 200) {
//           errorMessage += `. The server returned status code ${httpErrorInfo.statusCode}`;
//         } else {
//           errorMessage += ": The SDK returned null response. This typically means the server rejected the request (check retcode) or returned an invalid response format.";
//         }
//       } else {
//         errorMessage += ": Received null response from MT5 server. No HTTP response details captured.";
//       }
      
//       return {
//         message: errorMessage,
//         success: false,
//         rawResponse: clientResponse,
//         errorDetails: httpErrorInfo || {
//           note: "No error details captured. Check console logs for 'HTTP POST Response' to see the actual server response."
//         },
//         debugInfo: {
//           credentialsProvided: {
//             first_name: !!credentials.first_name,
//             email: !!credentials.email,
//             phone: !!credentials.phone,
//           }
//         }
//       };
//     }

//     // Extract client ID from response (handle both array and object formats)
//     let client_id;
    
//     if (Array.isArray(clientResponse)) {
//       if (clientResponse.length === 0) {
//         return {
//           message: "Client creation failed: Empty response array from MT5 server",
//           success: false,
//           rawResponse: clientResponse,
//         };
//       }
      
//       const firstResponse = clientResponse[0];
      
//       // Check for error in response
//       if (firstResponse?.retcode && firstResponse.retcode !== 0) {
//         const errorMessage = 
//           firstResponse?.description || 
//           firstResponse?.retcode_external || 
//           firstResponse?.message || 
//           `MT5 Error Code: ${firstResponse.retcode}`;
        
//         console.error("Client creation failed with retcode:", {
//           retcode: firstResponse.retcode,
//           retcode_external: firstResponse.retcode_external,
//           description: firstResponse.description,
//           fullResponse: firstResponse,
//         });
        
//         return {
//           message: `Client creation failed: ${errorMessage}`,
//           success: false,
//           retcode: firstResponse.retcode,
//           retcode_external: firstResponse.retcode_external,
//           rawResponse: firstResponse,
//         };
//       }
      
//       // Check if ID exists
//       if (!firstResponse?.id) {
//         console.error("Client creation failed - no ID in response:", firstResponse);
//         return {
//           message: `Client creation failed: No client ID returned. Response: ${JSON.stringify(firstResponse)}`,
//           success: false,
//           rawResponse: firstResponse,
//         };
//       }
      
//       client_id = firstResponse.id;
//     } else {
//       // Handle non-array response
//       if (clientResponse?.retcode && clientResponse.retcode !== 0) {
//         const errorMessage = 
//           clientResponse?.description || 
//           clientResponse?.retcode_external || 
//           clientResponse?.message || 
//           `MT5 Error Code: ${clientResponse.retcode}`;
        
//         return {
//           message: `Client creation failed: ${errorMessage}`,
//           success: false,
//           retcode: clientResponse.retcode,
//           rawResponse: clientResponse,
//         };
//       }
      
//       if (!clientResponse?.id) {
//         console.error("Client creation failed - unexpected response structure:", {
//           responseType: typeof clientResponse,
//           isArray: Array.isArray(clientResponse),
//           response: JSON.stringify(clientResponse, null, 2),
//         });
        
//         return {
//           message: `Client creation failed: Unexpected response structure. Response: ${JSON.stringify(clientResponse)}`,
//           success: false,
//           rawResponse: clientResponse,
//         };
//       }
      
//       client_id = clientResponse.id;
//     }
    
//     console.log("Client created successfully with ID:", client_id);

//     // Create the user
//     const userResponse = await mt5Instance.users.create({
//       Login: 0, // Let the server auto-assign a login
//       PassMain: credentials.password,
//       PassInvestor: credentials.invest_password,
//       rights: 0,
//       Group: credentials.group,
//       Name: credentials.first_name,
//       FirstName: credentials.first_name,
//       LastName: "", // Adjust if a last name is available
//       Company: credentials.company,
//       Language: "9", // Language code for English
//       City: "",
//       State: "",
//       ZipCode: "",
//       Address: "",
//       Country: credentials.country,
//       Phone: credentials.phone,
//       Email: credentials.email,
//       ID: 0, // placeholder
//       Status: 1, // Set to 1 to mark the account as enabled
//       Comment: "New account created by Web API",
//       Color: 0,
//       PhonePassword: credentials.password,
//       Leverage: 500,
//       Agent: 0,
//     });
//     console.log("User created:", userResponse);

//     if (!userResponse?.Login) {
//       return {
//         message: "Something went wrong while adding the user. Try again!",
//         success: false,
//         rawResponse: userResponse,
//       };
//     }

//     // Bind the user account to the client
//     const bindPayload = [{ user: userResponse.Login, client: client_id }];
//     const bindResult = await mt5Instance.clients.addUser(bindPayload);
//     console.log("Binding result:", bindResult);

//     // Deposit a fixed amount of 10,000 into the user's account
//     // const depositResponse = await mt5Instance.users.deposit({
//     //     Login: userResponse.Login,
//     //     Amount: 10000,
//     //     Comment: "Initial deposit of 10000",
//     // });
//     // console.log("Deposit result:", depositResponse);

//     return {
//       message: "Client and user added and bound successfully",
//       success: true,
//       user: userResponse.Login,
//     };
//   } catch (error) {
//     // Catch any unexpected errors in the entire pipeline
//     console.error("Unexpected error in clientPipeline:", {
//       message: error?.message,
//       stack: error?.stack,
//       error: error,
//     });
    
//     return {
//       message: error?.message || "An unexpected error occurred during account creation",
//       success: false,
//       error: error?.stack || error,
//     };
//   }
// }

// export default clientPipeline;
