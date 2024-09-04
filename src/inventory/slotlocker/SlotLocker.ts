import {
    ItemLockMode,
    ItemStack,
    world,
    Player,
    WorldInitializeAfterEvent,
} from "@minecraft/server";
import {
    EventHandler,
    Identifier,
    Runnable,
    StaticRunnable,
    Teseract,
} from "@teseractmcs/server-api";
import { Hardcore } from "../../index";

/**
 * Manages the locking and unlocking of inventory slots for players in Minecraft.
 *
 * The `SlotManager` class provides functionality to lock and unlock specific inventory slots
 * for players, ensuring that certain items are protected from being moved or altered. It also
 * handles automatic slot locking for all players and manages the appearance of locked items in
 * the player's inventory.
 *
 */
export default class SlotLocker extends StaticRunnable {
    private static lockerItem: Identifier = Identifier.of("minecraft", "air");
    private static scannerRunning: boolean = false;

    /**
     * Sets the item to be used as the locker item for locking slots.
     *
     * This method can only be called before the scanner starts running, which occurs
     * after the `@minecraft/server.WorldInitializeAfterEvent` is triggered.
     *
     * @param newLocker The new locker item identifier.
     */
    public static setLockerItem(newLocker: Identifier) {
        if (this.scannerRunning) {
            return Hardcore.LOGGER.error(
                "Scanner is already running. Consider changing the locker item before the @minecraft/server.WorldInitializeAfterEvent is triggered.",
            );
        }
        this.lockerItem = newLocker;
    }

    /**
     * @private Triggering this function will throw an error, as this task is not intended to be canceled.
     */
    public static override cancel(): void {
        if (!this.isCancelled()) {
            return Hardcore.LOGGER.info(
                "SlotManager cannot be stopped because it is not running",
            );
        }
        throw new Error("SlotManager cannot be canceled.");
    }

    @EventHandler
    private static onWorldinitAfter(event: WorldInitializeAfterEvent) {
        this.runTimer(5);
        Hardcore.LOGGER.debug(this.constructor.name + " running.");
        Object.seal(this);
    }

    public constructor() {
        super();
        Teseract.getEventManager().registerEvents(this);
        SlotLocker.scannerRunning = true;
    }

    /**
     * Locks all inventory slots for the given player.
     *
     * Iterates through all slots in the player's inventory and locks each one.
     *
     * @param player The player whose slots are to be locked.
     */
    public static lockAllSlots(player: Player) {
        for (let i = 0; i < 36; i++) {
            this.lockSlot(player, i);
        }
    }

    /**
     * Unlocks all inventory slots for the given player.
     *
     * Iterates through all slots in the player's inventory and unlocks each one.
     *
     * @param player The player whose slots are to be unlocked.
     */
    public static unlockAllSlots(player: Player) {
        for (let i = 0; i < 36; i++) {
            this.unlockSlot(player, i);
        }
    }

    /**
     * The main job of the SlotManager, executed at regular intervals.
     *
     * Scans the inventory of all players, locking and unlocking slots based on
     * the player's dynamic properties and the locker item. Items in locked slots
     * are set to the locker item, and any other items in those slots are removed
     * and spawned in the world.
     */
    public static override *onRunJob() {
        for (const player of world.getAllPlayers()) {
            const inventory = player.getComponent("inventory");
            const container = inventory.container;
            for (let i = 0; i < 36; i++) {
                const isLocked = player.getDynamicProperty("slot:" + i);
                const slot = container.getSlot(i);
                if (!isLocked) {
                    if (slot.getItem()?.typeId == this.lockerItem.toString())
                        slot.setItem();
                    continue;
                }
                const item = new ItemStack(this.lockerItem.toString());
                if (
                    slot?.getItem()?.typeId != this.lockerItem.toString() &&
                    slot.getItem()
                ) {
                    player.dimension.spawnItem(slot.getItem(), player.location);
                }
                item.lockMode = ItemLockMode.slot;
                container.setItem(i, item);
                yield;
            }
            yield;
        }
    }

    /**
     * Locks a specific slot for the given player.
     *
     * @param player The player whose slot is to be locked.
     * @param slotId The ID of the slot to be locked.
     */
    public static lockSlot(player: Player, slotId: number) {
        player.setDynamicProperty("slot:" + slotId, true);
        Hardcore.LOGGER.robust(
            `Slot ${slotId} locked for player '${player.name}'`,
        );
    }

    /**
     * Unlocks a specific slot for the given player.
     *
     * @param player The player whose slot is to be unlocked.
     * @param slotId The ID of the slot to be unlocked.
     */
    public static unlockSlot(player: Player, slotId: number) {
        player.setDynamicProperty("slot:" + slotId, false);
        Hardcore.LOGGER.robust(
            `Slot ${slotId} unlocked for player '${player.name}'`,
        );
    }

    /**
     * Checks if a specific slot is locked for the given player.
     *
     * @param player The player whose slot is being checked.
     * @param slotId The ID of the slot to check.
     * @returns `true` if the slot is locked, `false` otherwise.
     */
    public static isLocked(player: Player, slotId: number): boolean {
        const isLocked = player.getDynamicProperty("slot:" + slotId);
        return !isLocked ? false : true;
    }
}

Teseract.getEventManager().registerEvents(SlotLocker);
