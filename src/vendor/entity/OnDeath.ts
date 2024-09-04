import {
    EntityDieAfterEvent,
    EntityQueryOptions,
} from "@minecraft/server";

type Constructor<T = {}> = new (...args: any[]) => T;

function OnDeath<T>(filters: EntityQueryOptions) {
    return function (
        target: InstanceType<Constructor<T>>,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<
            (event: EntityDieAfterEvent) => void
        >,
    ) {
        target.constructor["_hardcoreEntity::onDeath"] = {
            filters: filters,
            callback: descriptor.value,
        };
    };
}
export default OnDeath;
