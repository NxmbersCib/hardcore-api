import { EffectTypes } from "@minecraft/server";
import { Identifier, TimerUtil } from "@teseractmcs/server-api";
import AttackEffectDurationOutOfBoundsError from "../../util/error/entity/attack-effect/AttackEffectDurationOutOfBoundsError";
import UnknownAttackEffectError from "../../util/error/entity/attack-effect/UnknownAttackEffectError";

class AttackEffect {
    constructor(
        public readonly effectId: string | Identifier,
        public readonly amplifier: number,
        public readonly duration: number = 20,
        public readonly showParticles: boolean = true,
    ) {
        if (!(effectId instanceof Identifier) && typeof effectId !== "string") {
            throw new TypeError(
                "AttackEffect object did not have a native handle",
            );
        }

        const effect = EffectTypes.get(
            effectId instanceof Identifier ? effectId.toString() : effectId,
        );

        if (!effect) {
            throw new UnknownAttackEffectError(
                "Effect " + effectId + " does not exist.",
            );
        }

        if (duration > TimerUtil.MaxTickRange) {
            throw new AttackEffectDurationOutOfBoundsError(
                "Effect '" +
                    effect +
                    "' has an out of bounds duration specified: " +
                    duration,
            );
        }
    }
}

export default AttackEffect;
