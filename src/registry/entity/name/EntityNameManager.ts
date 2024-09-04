import { EntitySpawnAfterEvent } from "@minecraft/server";
import { EventHandler, Identifier, Teseract } from "@teseractmcs/server-api";
import EntityNameRegistry from "./EntityNameRegistry";
import Registry from "../../Registry";
import Registries from "../../Registries";
import { Hardcore } from "../../../index";

export default class EntityNameManager {
    // public static addRegistry(registry: EntityNameRegistry) {
    //     this.registry.set(registry.ENTITY_ID, registry);
    //     Hardcore.LOGGER.robust(
    //         "Mob name registry added: " +
    //             registry.ENTITY_ID +
    //             ` '${registry.DISPLAY_NAME}'`,
    //     );
    // }
    public constructor() {
        Teseract.getEventManager().registerEvents(this);
    }

    @EventHandler
    private onMobSpawned(event: EntitySpawnAfterEvent) {
        if (!event.entity.isValid()) {
            return;
        }

        const registry = Registry.get(
            Registries.ENTITY_NAMETAG,
            Identifier.fromString(event.entity.typeId),
        );

        if (!registry) {
            return;
        }

        event.entity.nameTag = registry.DISPLAY_NAME;
    }
}
