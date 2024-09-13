import { Player } from "@minecraft/server";
import BaseItem from "../BaseItem";

/**
 * Represents an item that can be held in the inventory by a player in the game.
 *
 * The `TrinketItem` interface extends the `BaseItem` and defines additional
 * methods for handling the item when it is in the inventory of a player or not.
 */

interface TrinketItem extends BaseItem {
    onStartHolding(player: Player): void;
    onStopHolding(player: Player): void;
}

export default TrinketItem;
