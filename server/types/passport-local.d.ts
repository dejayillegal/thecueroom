// server/types/passport-local.d.ts

import "passport-local";

declare module "passport-local" {
  // Redeclare IVerifyOptions so that `message` is optional
  interface IVerifyOptions {
    message?: string;
    forcePasswordChange?: boolean;
  }
}