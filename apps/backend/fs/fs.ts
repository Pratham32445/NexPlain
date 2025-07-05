import fs from "fs";

export function createLocation(location: string) {
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
  }
}
