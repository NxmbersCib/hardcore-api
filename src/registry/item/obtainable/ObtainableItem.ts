import { Player } from "@minecraft/server";
import BaseItem from "../../item/BaseItem";

/**
 * Represents an item that can be obtained by a player in the game.
 *
 * The `ObtainableItem` interface extends the `BaseItem` and defines additional
 * methods for handling the item when it is obtained or lost by a player.
 *
 * Implementers of this interface must define the `onObtained` method, which is
 * triggered when a player obtains the item. An optional `onLost` method can be
 * defined to handle scenarios where the player loses the item.
 *
 * The player can only "loose" the item if an administrator uses `--obtainable --reset` command.
 */

interface ObtainableItem extends BaseItem {
    onObtained(player: Player): void;
    onLost?(player: Player): void;
}

export default ObtainableItem;
