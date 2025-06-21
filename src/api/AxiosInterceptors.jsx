// import { logoutSuccess } from "../redux/reuducer/authSlice";
// import { store } from "@/redux/store";
// import { t } from "@/utils";
// import axios from "axios";
// import Swal from "sweetalert2";

// const Api = axios.create({
//  baseURL: process.env.NEXT_PUBLIC_API_URL 
//     ? `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}` 
//     : 'http://localhost:3000/api/',
//   timeout: 30000, // 30 seconds timeout
//   retries: 3, // number of times to retry the request
//   retryDelay: 1000, // delay between retries in milliseconds
//   validateStatus: function (status) {
//     return status >= 200 && status < 500; // Accept all status codes less than 500
//   },
//   httpsAgent: new (require('https').Agent)({
//     rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true
//   })
// });

// let isUnauthorizedToastShown = false;

// // Add retry interceptor
// Api.interceptors.response.use(undefined, async (err) => {
//   const { config } = err;
//   if (!config || !config.retries) return Promise.reject(err);

//   config.retryCount = config.retryCount ?? 0;
  
//   if (config.retryCount >= config.retries) {
//     return Promise.reject(err);
//   }

//   config.retryCount += 1;
//   const delayRetryRequest = new Promise((resolve) => {
//     setTimeout(resolve, config.retryDelay || 1000);
//   });

//   return delayRetryRequest.then(() => Api(config));
// });

// Api.interceptors.request.use(function (config) {
//   let token = undefined;
//   let langCode = undefined;
//   if (typeof window !== "undefined") {
//     const state = store.getState();
//     token = state?.UserSignup?.data?.token;
//     langCode = state?.CurrentLanguage?.language?.code;
//   }

//   if (token) config.headers.authorization = `Bearer ${token}`;
//   if (langCode) config.headers["Content-Language"] = langCode;

//   // Force HTTP for local development
//   if (process.env.NODE_ENV === 'development' && config.url.startsWith('http://')) {
//     config.url = config.url.replace('https://', 'http://');
//   }

//   return config;
// });

// // Add a response interceptor
// Api.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   function (error) {
//     // Handle expired certificate error
//     if (error.code === 'CERT_HAS_EXPIRED' && process.env.NODE_ENV === 'development') {
//       const config = error.config;
//       // Retry the request with HTTP
//       config.url = config.url.replace('https://', 'http://');
//       return Api(config);
//     }

//     if (error.response && error.response.status === 401) {
//       // Call the logout function if the status code is 401
//       logoutSuccess();
//       if (!isUnauthorizedToastShown) {
//         Swal.fire({
//           icon: "error",
//           title: t("oops"),
//           text: t("userDeactivatedByAdmin"),
//           allowOutsideClick: false,
//           customClass: {
//             confirmButton: "Swal-confirm-buttons",
//           },
//         });
//         isUnauthorizedToastShown = true;
//         // Reset the flag after a certain period
//         setTimeout(() => {
//           isUnauthorizedToastShown = false;
//         }, 3000); // 3 seconds delay before allowing another toast
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default Api;
import { logoutSuccess } from "../redux/reuducer/authSlice";
import { store } from "@/redux/store";
import { t } from "@/utils";
import axios from "axios";
import Swal from "sweetalert2";

const Api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}`,
});


let isUnauthorizedToastShown = false;

Api.interceptors.request.use(function (config) {
  let token = undefined;
  let langCode = undefined;
  if (typeof window !== "undefined") {
    const state = store.getState();
    token = state?.UserSignup?.data?.token;
    langCode = state?.CurrentLanguage?.language?.code;
  }

  if (token) config.headers.authorization = `Bearer ${token}`;
  if (langCode) config.headers["Content-Language"] = langCode;

  return config;
});

// Add a response interceptor
Api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      // Call the logout function if the status code is 401
      logoutSuccess();
      if (!isUnauthorizedToastShown) {
        Swal.fire({
          icon: "error",
          title: t("oops"),
          text: t("userDeactivatedByAdmin"),
          allowOutsideClick: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
          },
        });
        isUnauthorizedToastShown = true;
        // Reset the flag after a certain period
        setTimeout(() => {
          isUnauthorizedToastShown = false;
        }, 3000); // 3 seconds delay before allowing another toast
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
