import { SHA256, Decryption_AES } from "../Encryption"
import { Set_PrivK, Set_PubK, Set_Data, Set_Gender, Set_Claims, Set_Submit, Set_Id } from "../UserData"
import { fetchAndDecodeHearts } from "./recievedHearts"
import { returnHearts_Late } from "./returnHearts"
import { FetchReturnedHearts } from "./Matching"
const SERVER_IP = process.env.SERVER_IP

// Admin Permit to Send Hearts
export var Permit = true

export const handleLog = async (data: any, recaptchaToken: any) => {
  try {
    Set_Id(data.id);
    const myHeaders = new Headers();
    myHeaders.append("g-recaptcha-response", recaptchaToken);
    console.log(recaptchaToken)
    const passHash = await SHA256(data.password);
    const bdy = JSON.stringify({
      _id: data.id,
      passHash: passHash
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      credentials:"include",
      body: bdy,
      redirect: 'follow'
    };

    const res = await fetch(`${SERVER_IP}/captcha/user/login`, requestOptions);

    if (!res.ok) {
      console.log(`HTTP Error: ${res.status} - ${res.statusText} - URL: ${SERVER_IP}/captcha/user/login`);
      return { "success": false, "credentialError": true };
    }
    const res_json = await res.json()
    const pvtKey_Enc: string = res_json.pvtKey_Enc
    const pvtKey_login = await Decryption_AES(pvtKey_Enc, data.password)
    Permit = res_json.permit
    Set_PrivK(pvtKey_login)
    Set_PubK(res_json.pubKey)
    Set_Gender(res_json.gender)
    Set_Submit(res_json.submit)
    await Set_Data(res_json.data)
    await Set_Claims(res_json.claims)

    await fetchAndDecodeHearts()

    if (res_json.submit === true) {
      if (Permit) {
        await returnHearts_Late()
      }
      await FetchReturnedHearts()
    }

    return { "success": true, "permit": res_json.permit, "publish": res_json.publish }
  }
  catch (err) {
    console.log(err)
    return { "success": false, "credentialError": false }
  }
}

export const handle_Logout = async () => {
  try {
    const res = await fetch(
      `${SERVER_IP}/session/logout`, {
      method: "GET"
    }
    )
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    return true;
  }
  catch (err) {
    console.log(err)
    return false
  }
}