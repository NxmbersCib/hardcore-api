import {
    Entity,
    EntityQueryOptions,
    Player,
    PlayerInteractWithEntityBeforeEvent,
} from "@minecraft/server";

type Constructor<T = {}> = new (...args: any[]) => T;

function OnInteracted<T>(filters: EntityQueryOptions) {
    return function (
        target: InstanceType<Constructor<T>>,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<
            (event: PlayerInteractWithEntityBeforeEvent) => void
        >,
    ) {
        target.constructor["_hardcoreEntity::onInteracted"] = {
            filters: filters,
            callback: descriptor.value,
        };
    };
}
export default OnInteracted;
