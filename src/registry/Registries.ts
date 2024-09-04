/**
 * Enumeration representing different types of item registries in the system.
 * 
 * This enum defines various categories of items, such as obtainable items, trinkets, holdable items,
 * resurrection items, and banned items. Each registry type can be used to classify and manage items
 * within these specific categories.
 * 
 */
enum Registries {
  /** Represents items that can be obtained in the game. */
  OBTAINABLE_ITEM = "OBTAINABLE_ITEM",

  /** Represents items that function as trinkets, often providing passive benefits. */
  TRINKET_ITEM = "TRINKET_ITEM",

  /** Represents items that can be held by the player. */
  HOLDABLE_ITEM = "HOLDABLE_ITEM",

  /** Represents items that can be used to resurrect a player or entity. */
  RESURRECT_ITEM = "RESURRECT_ITEM",

  /** Represents items that are banned and should not be used or obtained in the game. */
  BANNED_ITEM = "BANNED_ITEM",

  ENTITY_NAMETAG = "ENTITY_NAMETAG"
}

export default Registries;
