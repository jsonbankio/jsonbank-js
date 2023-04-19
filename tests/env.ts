import { Env } from "@xpresser/env";
import isCi from "is-ci";

const env = isCi
    ? {
          JSB_HOST: process.env.JSB_HOST!,
          JSB_PUBLIC_KEY: process.env.JSB_PUBLIC_KEY!,
          JSB_PRIVATE_KEY: process.env.JSB_PRIVATE_KEY!,
          JSB_TIMEOUT: Number(process.env.JSB_TIMEOUT! || 10000)
      }
    : Env(__dirname, {
          JSB_HOST: Env.is.string("https://api.jsonbank.io"),
          JSB_PUBLIC_KEY: Env.is.string(),
          JSB_PRIVATE_KEY: Env.is.string(),
          JSB_TIMEOUT: Env.is.number(10000)
      });

export default env;
