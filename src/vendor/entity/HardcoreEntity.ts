import {
    Entity,
    EntityDamageCause,
    EntityDieAfterEvent,
    EntityHurtAfterEvent,
    EntitySpawnAfterEvent,
    PlayerInteractWithEntityBeforeEvent,
    world,
} from "@minecraft/server";
import { Identifier } from "@teseractmcs/server-api";
import AttackEffect from "./AttackEffect";
import { EntityNameRegistry } from "../../registry/entity/index";
import { Registries, Registry } from "../../index";

/**
 * Decorator to define a Hardcore Entity with custom behavior.
 *
 * @param entityId - The unique identifier for the entity.
 * @param nameTag - The display name of the entity.
 * @returns A class decorator that extends the target class with custom entity logic.
 */
function HardcoreEntity(entityId: Identifier, nameTag: string) {
    /**
     * @param target - The class being decorated.
     * @returns - The extended class with custom entity behavior.
     */
    return function _DecoratorName<T extends { new (...args: any[]): {} }>(
        target: T,
    ): T {
        // Attach metadata to the class
        if (!target["_hardcoreEntity"]) {
            target["_hardcoreEntity"] = {};
        }

        target["_hardcoreEntity"]["typeId"] = entityId;
        target["_hardcoreEntity"]["typeId"]["nameTag"] = nameTag;

        return class extends target implements EntityNameRegistry {
            public ENTITY_ID: string = entityId.toString();
            public DISPLAY_NAME: string = nameTag;

            constructor(...args: any[]) {
                super(...args);
                Registry.register(Registries.ENTITY_NAMETAG, entityId, this);
                // Subscribe to entity death events
                world.afterEvents.entityDie.subscribe(
                    (arg: EntityDieAfterEvent) => {
                        if (arg.deadEntity?.typeId !== entityId?.toString()) {
                            return;
                        }
                        this.onDeath(arg);
                    },
                );

                // Subscribe to entity hurt events
                world.afterEvents.entityHurt.subscribe(
                    (arg: EntityHurtAfterEvent) => {
                        if (
                            // arg.hurtEntity.typeId !== entityId.toString() &&
                            arg.damageSource.damagingEntity?.typeId ===
                                entityId.toString()
                        ) {
                            const effects =
                                (target["_hardcoreEntity"]
                                    ?._attackEffects as AttackEffect[]) || [];
                            const filter =
                                target["_hardcoreEntity"]?._attackEffects
                                    ?.filters;

                            // Apply effects if any are defined
                            for (const effect of effects) {
                                if (filter) {
                                    const entities =
                                        arg.hurtEntity.dimension.getEntities(
                                            filter,
                                        );
                                    const targetEntity = entities.find(
                                        (entity) =>
                                            entity.id === arg.hurtEntity.id,
                                    );
                                    targetEntity?.addEffect(
                                        effect.effectId.toString(),
                                        effect.duration,
                                        {
                                            amplifier: effect.amplifier,
                                            showParticles: effect.showParticles,
                                        },
                                    );
                                } else {
                                    arg.hurtEntity.addEffect(
                                        effect.effectId.toString(),
                                        effect.duration,
                                        {
                                            amplifier: effect.amplifier,
                                            showParticles: effect.showParticles,
                                        },
                                    );
                                }
                            }
                        }
                        if (arg.hurtEntity.typeId === entityId.toString()) {
                            this.onHurt(arg);
                        }
                    },
                );

                // Subscribe to player interaction with entity events
                world.beforeEvents.playerInteractWithEntity.subscribe(
                    (arg: PlayerInteractWithEntityBeforeEvent) => {
                        if (arg.target.typeId !== entityId.toString()) {
                            return;
                        }
                        target["_hardcoreEntity::onInteracted"]?.callback?.call(
                            this,
                            arg,
                        );
                    },
                );

                // Subscribe to entity spawn events
                world.afterEvents.entitySpawn.subscribe(
                    (arg: EntitySpawnAfterEvent) => {
                        if (arg.entity.typeId !== entityId.toString()) {
                            return;
                        }
                        target["_hardcoreEntity::onSpawned"]?.call(this, arg);
                    },
                );
            }

            /**
             * Handle the entity death event.
             * @param {EntityDieAfterEvent} event - The event triggered after the entity dies.
             */
            private onDeath(event: EntityDieAfterEvent) {
                target["_hardcoreEntity::onDeath"]?.callback?.call(this, event);
            }

            /**
             * Handle the entity hurt event.
             * @param {EntityHurtAfterEvent} event - The event triggered after the entity is hurt.
             */
            private onHurt(event: EntityHurtAfterEvent) {
                target["_hardcoreEntity::onHurt"]?.callback?.call(this, event);
            }

            /**
             * Handle the player interaction with entity event.
             * @param {PlayerInteractWithEntityBeforeEvent} event - The event triggered before a player interacts with the entity.
             */
            private onInteracted(event: PlayerInteractWithEntityBeforeEvent) {}

            /**
             * Handle the entity spawn event.
             * @param {EntitySpawnAfterEvent} event - The event triggered after the entity spawns.
             */
            private onSpawned(event: EntitySpawnAfterEvent) {}
        };
    };
}

export default HardcoreEntity;
