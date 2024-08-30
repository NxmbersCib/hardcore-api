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

@CommandAlias("-obtainable")
@Permission((p) => p.hasTag("admin") || p.isOp())
class ObtainableItemManager extends Runnable {
    public setObtained(
        player: Player,
        itemId: Identifier,
        obtained: boolean,
    ): void {
        player.setDynamicProperty(this.formatObtainable(itemId), obtained);
        const obtainable = Registry.get(Registries.OBTAINABLE_ITEM, itemId)
        if (obtained) {
            obtainable.onObtained(player);
        } else {
            if (obtainable.onLost) obtainable?.onLost(player);
        }
    }

    public constructor() {
        super();
        this.runTimer(5);
        Teseract.getCommanManager().registerCommand(this);
    }

    private getInventoryStrings(player: Player) {
        const items: string[] = [];
        const inventory = player.getComponent("inventory").container;
        for (let i = 0; i < inventory.size; i++) {
            items.push(inventory.getItem(i)?.typeId ?? "minecraft:air");
        }
        return items;
    }

    private formatObtainable(id: Identifier) {
        return `obtained:${id}`;
    }

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
            LOGGER.error(error);
        }
    }

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
