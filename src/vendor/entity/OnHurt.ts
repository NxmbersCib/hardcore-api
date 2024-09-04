import {
    Entity,
    EntityDamageSource,
    EntityHurtAfterEvent,
    EntityQueryOptions,
} from "@minecraft/server";

type Constructor<T = {}> = new (...args: any[]) => T;

function OnHurt<T>(filters: EntityQueryOptions) {
    return function (
        target: InstanceType<Constructor<T>>,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<
            (event: EntityHurtAfterEvent) => void
        >,
    ) {
        target.constructor["_hardcoreEntity::onHurt"] = {
            filters: filters,
            callback: descriptor.value,
        };
    };
}

export default OnHurt;
