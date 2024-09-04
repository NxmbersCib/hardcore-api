import HardcoreEntityError from "../../util/error/entity/HardcoreEntityError";
import AttackEffect from "./AttackEffect";
import { Entity, EntityQueryOptions } from "@minecraft/server";

type Constructor<T = {}> = new (...args: any[]) => T;

function AttackEffects<T extends Constructor<InstanceType<T>> = any>(
    filters:
        | EntityQueryOptions
        | ((this: InstanceType<T>, entity: Entity) => EntityQueryOptions),
    ...effects: AttackEffect[]
) {
    return function (target: InstanceType<Constructor<T>>) {
        LOGGER.info(target["_hardcoreEntity"]);
        if (!target["_hardcoreEntity"]) {
            target["_hardcoreEntity"] = {};
        }

        target["_attackEffects::filters"] = filters;
        target["_hardcoreEntity"]["_attackEffects"] = effects;
    };
}

export default AttackEffects;
