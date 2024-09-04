import { Identifier } from "@teseractmcs/server-api";
import BaseItem from "./item/BaseItem";
import ObtainableItemManager from "./item/obtainable/ObtainableItemManager";
import Registries from "./Registries";
import ObtainableItem from "./item/obtainable/ObtainableItem";
import EntityNameRegistry from "./entity/name/EntityNameRegistry";
import EntityNameManager from "./entity/name/EntityNameManager";
import { Hardcore } from "../index";

type ManagerType = {
    OBTAINABLE_ITEM: ObtainableItemManager;
    TRINKET_ITEM: any;
    HOLDABLE_ITEM: "HOLDABLE_ITEM";
    RESURRECT_ITEM: "RESURRECT_ITEM";
    BANNED_ITEM: "BANNED_ITEM";
    ENTITY_NAMETAG: EntityNameManager;
};

type RegistriesType = {
    OBTAINABLE_ITEM: ObtainableItem;
    TRINKET_ITEM: ObtainableItem;
    HOLDABLE_ITEM: "HOLDABLE_ITEM";
    RESURRECT_ITEM: "RESURRECT_ITEM";
    BANNED_ITEM: "BANNED_ITEM";
    ENTITY_NAMETAG: EntityNameRegistry;
};

/**
 * A class responsible for managing item registries and their corresponding managers.
 *
 * The `Registry` class provides functionality to register, retrieve, list, and manage items
 * within various registries. It also allows access to managers specific to each registry type.
 *
 * This class is used to ensure that items are correctly categorized and managed across
 * different item types such as obtainable items, trinkets, holdable items, resurrection items,
 * and banned items.
 */
class Registry {
    private static registries: Map<Registries, Map<string, any>> = new Map();
    private static managers: Map<Registries, any> = new Map();

    static {
        for (const registryType in Registries) {
            this.registries.set(
                Registries[registryType as keyof typeof Registries],
                new Map<string, BaseItem>(),
            );
        }

        this.managers.set(
            Registries.OBTAINABLE_ITEM,
            new ObtainableItemManager(),
        );
        this.managers.set(Registries.ENTITY_NAMETAG, new EntityNameManager());
    }

    /**
     * Registers an item in the specified registry.
     *
     * @param registryType The type of registry to register the item in.
     * @param item The item to be registered.
     * @throws If the item is already registered in the specified registry.
     */
    public static register<T extends keyof typeof Registries>(
        registryType: Registries,
        identifier: Identifier,
        item: RegistriesType[T],
    ): void {
        const registry = this.registries.get(registryType);
        if (!registry) {
            throw new Error(`Registry of type '${registryType}' not found.`);
        }
        if (registry.has(identifier.toString())) {
            throw new Error(
                `Registry target with identifier '${identifier}' is already registered in ${registryType}.`,
            );
        }
        registry.set(identifier.toString(), item);
        Hardcore.LOGGER.debug(
            `Registry target '${identifier}' registered in ${registryType}.`,
        );
    }

    /**
     * Retrieves an item from the specified registry.
     *
     * @param registryType The type of registry to retrieve the item from.
     * @param itemId The identifier of the item to retrieve.
     * @returns The item corresponding to the specified identifier and registry type.
     */
    public static get<T extends keyof typeof Registries>(
        registryType: T,
        itemId: Identifier,
    ): RegistriesType[T] {
        const registry = this.registries.get(Registries[registryType]);
        return registry?.get(itemId.toString()) as RegistriesType[T];
    }

    /**
     * Lists all items in the specified registry.
     *
     * @param registryType The type of registry to list the items from.
     * @returns An array of all items in the specified registry.
     */
    public static list<T extends keyof typeof Registries>(
        registryType: T,
    ): RegistriesType[T][] {
        const registry = this.registries.get(Registries[registryType]);
        return registry
            ? (Array.from(registry.values()) as RegistriesType[T][])
            : [];
    }

    /**
     * Retrieves the manager for the specified registry type.
     *
     * @param registryType The type of registry to get the manager for.
     * @returns The manager associated with the specified registry type.
     * @throws If there is no manager for the specified registry type.
     */
    public static getManager<T extends keyof typeof Registries>(
        registryType: T,
    ): ManagerType[T] {
        const manager = this.managers.get(Registries[registryType]);
        if (!manager) {
            throw new Error(
                `Registry type ${registryType} does not have a handler.`,
            );
        }
        return manager as ManagerType[T];
    }
}

export default Registry;
