import { Identifier } from "@teseractmcs/server-api";

/**
 * Represents a base item in the system.
 */
interface BaseItem {
    /**
     * The unique identifier for this item.
     */
    ITEM_ID: Identifier;
}

export default BaseItem;
