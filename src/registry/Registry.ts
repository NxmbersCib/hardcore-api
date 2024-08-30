import { Identifier } from "@teseractmcs/server-api";
import BaseItem from "./item/BaseItem";
import ObtainableItemManager from "./item/obtainable/ObtainableItemManager";
import Registries from "./Registries";
import ObtainableItem from "./item/obtainable/ObtainableItem";

type ManagerType = {
    OBTAINABLE_ITEM: ObtainableItemManager;
    TRINKET_ITEM: any;
    HOLDABLE_ITEM: "HOLDABLE_ITEM";
    RESURRECT_ITEM: "RESURRECT_ITEM";
    BANNED_ITEM: "BANNED_ITEM";
};

type RegistriesType = {
    OBTAINABLE_ITEM: ObtainableItem;
    TRINKET_ITEM: ObtainableItem;
    HOLDABLE_ITEM: "HOLDABLE_ITEM";
    RESURRECT_ITEM: "RESURRECT_ITEM";
    BANNED_ITEM: "BANNED_ITEM";
};

class Registry {
    private static registries: Map<Registries, Map<Identifier, BaseItem>> =
        new Map();
    private static managers: Map<Registries, any> = new Map();

    static {
        for (const registryType in Registries) {
            this.registries.set(
                Registries[registryType as keyof typeof Registries],
                new Map<Identifier, BaseItem>(),
            );
        }

        this.managers.set(
            Registries.OBTAINABLE_ITEM,
            new ObtainableItemManager(),
        );
    }

    public static register<T extends BaseItem>(
        registryType: Registries,
        item: T,
    ): void {
        const registry = this.registries.get(registryType);
        if (!registry) {
            throw new Error(`Registry of type '${registryType}' not found.`);
        }
        if (registry.has(item.ITEM_ID)) {
            throw new Error(
                `Item with identifier '${item.ITEM_ID}' is already registered in ${registryType}.`,
            );
        }
        registry.set(item.ITEM_ID, item);
        LOGGER.info(`Item '${item.ITEM_ID}' registered in ${registryType}.`);
    }

    public static get<T extends keyof typeof Registries>(
        registryType: T,
        itemId: Identifier,
    ): RegistriesType[T] {
        const registry = this.registries.get(Registries[registryType]);
        return registry?.get(itemId) as RegistriesType[T];
    }

    public static list<T extends keyof typeof Registries>(
        registryType: T,
    ): RegistriesType[T][] {
        const registry = this.registries.get(Registries[registryType]);
        return registry
            ? (Array.from(registry.values()) as RegistriesType[T][])
            : [];
    }

    public static getManager<T extends keyof typeof Registries>(
        registryType: T,
    ): ManagerType[T] {
        const manager = this.managers.get(Registries[registryType]);
        if (!manager) {
            throw new Error(
                `No hay un manejador para el tipo de registro ${registryType}.`,
            );
        }
        return manager as ManagerType[T];
    }
}

export default Registry;
