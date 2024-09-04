import {
    CommandAlias,
    Identifier,
    Optional,
    Permission,
    Runnable,
    SubCommand,
    Teseract,
} from "@teseractmcs/server-api";
import Registries from "../../Registries";
import Registry from "../../Registry";
import { Player, world } from "@minecraft/server";
import { Hardcore } from "../../../index";
/**
 * Manages the obtainable items for players within the game.
 *
 * The `ObtainableItemManager` class is responsible for tracking and managing
 * the status of obtainable items for players. It provides methods to set and
 * check whether a player has obtained a specific item. Additionally, it can
 * reset the obtained status of items via a subcommand.
 *
 * This class runs periodically to check player inventories and updates the
 * status of obtainable items accordingly.
 *
 */

@CommandAlias("-obtainable")
@Permission((p) => p.hasTag("admin") || p.isOp())
class ObtainableItemManager extends Runnable {
    private formatObtainable(id: Identifier) {
        return `obtained:${id}`;
    }

    private getInventoryStrings(player: Player) {
        const items: string[] = [];
        const inventory = player.getComponent("inventory").container;
        for (let i = 0; i < inventory.size; i++) {
            items.push(inventory.getItem(i)?.typeId ?? "minecraft:air");
        }
        return items;
    }

    public constructor() {
        super();
        this.runTimer(5);
        Teseract.getCommandManager().registerCommands(this);
    }

    /**
     * Sets the obtained status of an item for a player.
     *
     * @param player - The player whose item status is being updated.
     * @param itemId - The identifier of the item.
     * @param obtained - `true` if the item is obtained, `false` otherwise.
     */
    public setObtained(
        player: Player,
        itemId: Identifier,
        obtained: boolean,
    ): void {
        player.setDynamicProperty(this.formatObtainable(itemId), obtained);
        const obtainable = Registry.get(Registries.OBTAINABLE_ITEM, itemId);
        if (!obtainable) {
            return Hardcore.LOGGER.error(`Obtainable ${itemId} not found`);
        }
        if (obtained) {
            obtainable.onObtained(player);
        } else {
            if (obtainable.onLost) obtainable?.onLost(player);
        }
    }

    /**
     * Checks if a player has obtained a specific item.
     *
     * @param player - The player whose item status is being checked.
     * @param itemId - The identifier of the item.
     * @returns `true` if the player has obtained the item, `false` otherwise.
     */
    public hasObtained(player: Player, itemId: Identifier) {
        const obtainable = Registry.get(Registries.OBTAINABLE_ITEM, itemId);
        if (!obtainable) {
            return Hardcore.LOGGER.error(`Obtainable ${itemId} not found`);
        }
        return player.getDynamicProperty(this.formatObtainable(itemId));
    }

    /**
     * Periodically checks all players' inventories and updates the obtained status of items.
     */
    public override *onRunJob(): Generator<any, any, any> {
        try {
            for (const player of world.getAllPlayers()) {
                for (const [id, obtainable] of Registry.list(
                    Registries.OBTAINABLE_ITEM,
                ).entries()) {
                    const obtainableId = this.formatObtainable(
                        obtainable.ITEM_ID,
                    );

                    if (player.getDynamicProperty(obtainableId)) {
                        continue;
                    }

                    if (
                        !this.getInventoryStrings(player).includes(
                            obtainable.ITEM_ID.toString(),
                        )
                    ) {
                        continue;
                    }

                    this.setObtained(player, obtainable.ITEM_ID, true);
                    yield;
                }
                yield;
            }
        } catch (error) {
            Hardcore.LOGGER.error(error);
        }
    }

    /**
     * Resets the obtained status of an item for a player via a subcommand.
     *
     * @param origin - The player who issued the command.
     * @param obtainableId - The identifier of the obtainable item to reset.
     * @param target - The target player whose item status is to be reset. If not provided, the origin player is used.
     */
    @SubCommand("--reset")
    private onResetCommand(
        origin: Player,
        obtainableId: string,
        @Optional target: Player,
    ) {
        const obtainable = Registry.list(Registries.OBTAINABLE_ITEM).find(
            (item) =>
                item.ITEM_ID.replace(/.*?(:)/g, "") ==
                obtainableId.replace(/.*?(:)/g, ""),
        );

        if (!obtainable) {
            return origin.sendMessage(
                `§cObtainable item '${obtainableId}' not found in the registry`,
            );
        }
        this.setObtained(target ?? origin, obtainable.ITEM_ID, false);
    }
}

export default ObtainableItemManager;
