import { Player } from "@minecraft/server";
import BaseItem from "registry/item/BaseItem";

interface ObtainableItem extends BaseItem {
    onObtained(player: Player): void;
    onLost?(player: Player): void;
}

export default ObtainableItem;
