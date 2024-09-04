import { ActionForm, Logger, Teseract } from "@teseractmcs/server-api";

class Hardcore {
    public static readonly LOGGER: Logger = Teseract.getLogger("hardcore-api");
}

export { Hardcore };

export * from "./registry/index";
export * from "./registry/item/index";

export * from "./registry/entity/index";

export * from "./inventory/index";

export * from "./vendor/index";
