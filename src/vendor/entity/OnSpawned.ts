import { Entity, EntitySpawnAfterEvent } from "@minecraft/server";

type Constructor<T = {}> = new (...args: any[]) => T;

function OnSpawned<T>(
    target: InstanceType<Constructor<T>>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
        (entity: EntitySpawnAfterEvent) => void
    >,
) {
    target.constructor["_hardcoreEntity::onSpawned"] = descriptor.value;
}

export default OnSpawned;
