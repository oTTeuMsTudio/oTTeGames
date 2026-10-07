# Build the site catalog for the Adventure Artist Blueprint Book.
# Reads the Unreal editor dump and writes src/data/blueprint-book.json.

import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DUMP = os.path.abspath(
    os.path.join(
        ROOT,
        "..",
        "..",
        "..",
        "Unreal Projects",
        "adventureartist",
        "Study",
        "_raw",
        "assets",
    )
)
OUT_PATH = os.path.join(ROOT, "src", "data", "blueprint-book.json")

SKIP_CLASS_PARTS = ("Knot", "Comment", "Reroute")
CALL_CLASS_PARTS = (
    "CallFunction",
    "CallParent",
    "Message",
    "CustomEvent",
    "Timeline",
    "MacroInstance",
    "SpawnActor",
    "DynamicCast",
    "IfThenElse",
)

CHAPTERS = [
    {
        "part": {
            "key": "part-1",
            "title": "Part I. The Adventure",
            "summary": (
                "The adventure itself. Shared contracts, the player and the enemy, "
                "keys, switches, the cube, platforms, traps, the level exit, the screens, "
                "and the art-track actors that dress the rooms."
            ),
        },
        "slug": "contracts",
        "title": "Contracts and Shared Functions",
        "intro": (
            "These assets are the shared language of the adventure. "
            "BPI_Interaction is the on/off call used by switches. "
            "BPI_PlayerKeys is the call the player answers when a key is collected or when the HUD asks what is held. "
            "Enum_KeyType and Struct_KeyData are the key's type and payload. "
            "BPL_FPGame holds the functions other Blueprints call: set a key mesh from the key map, find the player, and play a footstep sound. "
            "The stored enum names came back as NewEnumerator0. That token is what the pins contain."
        ),
        "assets": [
            "BPI_Interaction",
            "BPI_PlayerKeys",
            "Enum_KeyType",
            "Struct_KeyData",
            "BPL_FPGame",
        ],
    },
    {
        "slug": "player-and-enemy",
        "title": "The Player and the Enemy",
        "intro": (
            "BP_AdventureCharacter is the first-person player for the adventure: input, weapons inherited from the shooter sample, keys, damage, and the HUD. "
            "BP_Enemy is the opposing character. "
            "Both graphs are written in the book in full, including functions whose names are still the editor defaults NewFunction and Test."
        ),
        "assets": ["BP_AdventureCharacter", "BP_Enemy"],
    },
    {
        "slug": "keys",
        "title": "Keys",
        "intro": (
            "BP_Key is the pickup. Its construction script asks the function library to dress the mesh from the key map, and its event graph handles what happens when the player overlaps it. "
            "BP_Keyport is in the content folder, and the editor dump could not load it."
        ),
        "assets": ["BP_Key", "BP_Keyport"],
    },
    {
        "slug": "switches-and-the-cube",
        "title": "Switches and the Cube",
        "intro": (
            "BP_Switch is the overlap switch. The construction script paints it with the off material. "
            "The event graph paints the on material and sends fnBPISwitchOn and fnBPISwitchOff to the actors in InteractObjectList. "
            "BP_Cube is the cube those systems spawn and move."
        ),
        "assets": ["BP_Switch", "BP_Cube"],
    },
    {
        "slug": "platforms",
        "title": "Platforms",
        "intro": (
            "BP_Platform moves its mesh on the timeline TM_MovePlatform between a start location and a target point. "
            "fnBPISwitchOn and fnBPISwitchOff start and stop that motion. "
            "BP_Platform_Dot is the companion platform Blueprint."
        ),
        "assets": ["BP_Platform", "BP_Platform_Dot"],
    },
    {
        "slug": "traps",
        "title": "Traps",
        "intro": (
            "BP_TrapBase holds the shared damage call, fnApplyDamageToTarget. "
            "BP_TrapFire and BP_TrapSpikes are the two traps built on that idea. "
            "Where a child only calls the parent, that is the whole graph."
        ),
        "assets": ["BP_TrapBase", "BP_TrapFire", "BP_TrapSpikes"],
    },
    {
        "slug": "leaving-the-level",
        "title": "Leaving the Level",
        "intro": "BP_LevelTransition is the Blueprint that changes level. Its event graph is the whole of its logic.",
        "assets": ["BP_LevelTransition"],
    },
    {
        "slug": "screens",
        "title": "Screens",
        "intro": (
            "WBP_PlayerHUD is the in-game widget. It exposes fnAddKeyHUD and fnSetHP. "
            "WBP_WinScreen and WBP_EliminatedScreen are the end-of-run widgets. "
            "The dump did not record their widget trees, so these pages are the graph logic only."
        ),
        "assets": ["WBP_PlayerHUD", "WBP_WinScreen", "WBP_EliminatedScreen"],
    },
    {
        "slug": "the-art-track",
        "title": "The Art Track",
        "intro": (
            "The Artist folder repeats the gameplay actors for the art pass and adds the pieces that dress a room. "
            "BP_Switch_ArtTrack, BP_TrapFire_ArtTrack, and BP_TrapSpikes_ArtTrack sit beside the designer versions. "
            "BP_CubeSpawn creates cubes. BP_BGM plays the music. BP_DA_Footsteps chooses a footstep sound. "
            "BP_RoomLogo, BP_00, BP_02, and BP_03 are the room marks."
        ),
        "assets": [
            "BP_Switch_ArtTrack",
            "BP_TrapFire_ArtTrack",
            "BP_TrapSpikes_ArtTrack",
            "BP_CubeSpawn",
            "BP_BGM",
            "BP_DA_Footsteps",
            "BP_RoomLogo",
            "BP_00",
            "BP_02",
            "BP_03",
        ],
    },
    {
        "part": {
            "key": "part-2",
            "title": "Part II. Templates and Prototypes",
            "summary": (
                "Epic's first-person template, the touch controls, three prototyping actors, "
                "and the mannequin animation Blueprint. They are still in the project beside the adventure."
            ),
        },
        "slug": "first-person-template",
        "title": "The First Person Template",
        "intro": (
            "These are Epic's first-person template assets, still in the project beside the adventure. "
            "BP_FirstPersonCharacter moves and aims. The controller, camera manager, and game mode are the rest of that pawn. "
            "ABP_FP_Copy and CtrlRig_FPWarp are its animation assets."
        ),
        "assets": [
            "BP_FirstPersonCharacter",
            "BP_FirstPersonPlayerController",
            "BP_FP_CameraManager",
            "GM_FirstPerson",
            "ABP_FP_Copy",
            "CtrlRig_FPWarp",
        ],
    },
    {
        "slug": "touch-controls",
        "title": "Touch Controls",
        "intro": (
            "BPI_TouchInterface declares the thumbstick and jump messages. "
            "UI_Thumbstick is the stick widget, and UI_TouchSimple is the simple touch HUD that binds it."
        ),
        "assets": ["BPI_TouchInterface", "UI_Thumbstick", "UI_TouchSimple"],
    },
    {
        "slug": "prototype-actors",
        "title": "Prototype Actors",
        "intro": (
            "The Level Prototyping folder supplies three interactable actors. "
            "BP_DoorFrame builds a door from frame meshes and checks keys. "
            "BP_JumpPad launches whoever overlaps it. "
            "BP_WobbleTarget is the practice target."
        ),
        "assets": ["BP_DoorFrame", "BP_JumpPad", "BP_WobbleTarget"],
    },
    {
        "slug": "the-mannequin",
        "title": "The Mannequin",
        "intro": (
            "ABP_Unarmed is the mannequin locomotion animation Blueprint: idle, walk and run, jump, fall, and land, plus the event graph that drives those states. "
            "The three control rigs are in the project. Where a rig graph has nodes, those nodes are listed. Empty rig graphs are named rather than invented."
        ),
        "assets": [
            "ABP_Unarmed",
            "CR_Mannequin_Body",
            "CR_Mannequin_FootIK",
            "CR_Mannequin_Procedural",
        ],
    },
    {
        "part": {
            "key": "part-3",
            "title": "Part III. The Arena Shooter",
            "summary": (
                "Epic's arena shooter sample, included in this project and partly reused by the adventure character. "
                "Player, mode, HUD, weapons, pickups, AI, and weapon animation."
            ),
        },
        "slug": "shooter-player",
        "title": "Shooter Player, Mode, and HUD",
        "intro": (
            "Variant_Shooter is Epic's arena sample, included in this project and partly reused by the adventure character. "
            "This chapter is the player pawn, the player controller, the game mode and its score, the shooter interface, and the HUD widgets, including the touch layout."
        ),
        "assets": [
            "BP_FPShooter",
            "BP_ShooterController",
            "GM_Shooter",
            "BPI_Shooter",
            "HUD_Shooter",
            "UI_Overlay",
            "UI_WeaponCounter",
            "BPI_Touch_Shooter",
            "UI_TouchInterface_Shooter",
        ],
    },
    {
        "slug": "weapons-and-pickups",
        "title": "Weapons and Pickups",
        "intro": (
            "BPI_Pickups and BPI_WeaponHolder are the contracts between the pawn and a weapon. "
            "BP_WeaponBase fires the bullet. The pistol, rifle, and grenade launcher are the three children. "
            "BP_FirstPersonProjectile and BP_PistolBullet are the projectiles. "
            "BP_Pickup spins in the arena until someone collects it. "
            "ST_WeaponTable is the weapon data struct. Its fields were not in the dump."
        ),
        "assets": [
            "BPI_Pickups",
            "BPI_WeaponHolder",
            "BP_WeaponBase",
            "BP_Weapon_Pistol",
            "BP_Weapon_Rifle",
            "BP_Weapon_GrenadeLauncher",
            "BP_FirstPersonProjectile",
            "BP_PistolBullet",
            "BP_Pickup",
            "ST_WeaponTable",
        ],
    },
    {
        "slug": "shooter-ai",
        "title": "Shooter AI",
        "intro": (
            "BP_FPShooter_AI is the enemy pawn and BP_AICont is its controller. "
            "EnvQueryContext_Target names the query target. "
            "The State Tree tasks and the line-of-sight condition cover sensing, facing, shooting, and picking a random float."
        ),
        "assets": [
            "BP_FPShooter_AI",
            "BP_AICont",
            "EnvQueryContext_Target",
            "StateTreeTask_SenseEnemies",
            "StateTreeCondition_HasLineOfSightToTarget",
            "StateTreeTask_FaceActor",
            "StateTreeTask_FaceLocation",
            "StateTreeTask_ShootAtTarget",
            "StateTreeTask_SetRandomFloat",
        ],
    },
    {
        "slug": "shooter-animation",
        "title": "Shooter Animation",
        "intro": (
            "These are the first-person and third-person weapon animation Blueprints, the two hand-adjustment control rigs, and the asset-guidelines Blueprint. "
            "The animation Blueprints are pose graphs, state names, and transition conditions, and their event graphs are execution."
        ),
        "assets": [
            "ABP_FP_Pistol",
            "ABP_FP_Weapon",
            "ABP_TP_Pistol",
            "ABP_TP_Rifle",
            "Ctrl_HandAdjusment",
            "Ctrl_HandAdjusment_Pistol",
            "BP_AssetGuidelines_Shooter",
        ],
    },
]

PREFACE = [
    "Adventure Artist contains three layers of Blueprint work. The adventure itself is under AdventureGame: a first-person player, keys, switches, a cube, platforms, fire and spike traps, a level transition, and the screens that end a run. The Artist folder is the art pass of those ideas, plus music, footsteps, a cube spawner, and room logos. Around that work the project still holds Epic's first-person template, a few prototyping actors, the mannequin animation Blueprint, and the Variant Shooter sample.",
    "On this site the same three layers are the menu. Part I is the adventure, Part II is the template and the prototypes, and Part III is the arena shooter. Each chapter explains the group. Each Blueprint has its own page, and the left menu lists that chapter's Blueprints while you are reading it.",
    "The pages follow the dump. An event or a function is a graph. The calls named on a page are the function, event, cast, and timeline nodes in that graph. A graph with no nodes is named and left empty. Nothing here fills a blank the dump left empty.",
    "Parent classes, component trees, variable defaults, widget trees, and enum display names are empty for almost every asset. Variables mentioned on a page are the ones Get and Set nodes name. BP_Keyport did not load. Many control-rig graphs are named and contain no nodes.",
    "The PDF is the same record, typeset as a book: every graph written out as the steps it runs. These pages are the map of that book.",
]


def slugify(name):
    text = name.strip().lower()
    text = text.replace("_", "-")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "asset"


def asset_name(data):
    if data.get("asset_name"):
        return data["asset_name"]
    package = data.get("package") or ""
    leaf = package.rstrip("/").split("/")[-1]
    if "." in leaf:
        leaf = leaf.split(".")[0]
    return leaf


def interesting_calls(graph):
    calls = []
    for node in graph.get("nodes") or []:
        cls = node.get("class") or ""
        if any(part in cls for part in SKIP_CLASS_PARTS):
            continue
        if not any(part in cls for part in CALL_CLASS_PARTS):
            continue
        title = (node.get("title") or "").strip()
        if not title or title in calls:
            continue
        calls.append(title)
        if len(calls) == 6:
            break
    return calls


def summarize_graphs(graphs):
    filled = []
    empty_names = []
    for graph in graphs:
        name = graph.get("name") or "Graph"
        nodes = graph.get("nodes") or []
        if nodes:
            filled.append(
                {
                    "name": name,
                    "nodes": len(nodes),
                    "calls": interesting_calls(graph),
                }
            )
        else:
            empty_names.append(name)
    return filled, empty_names


def reference_sentence(name, data):
    kind = data.get("kind")
    if kind == "error":
        return "The editor dump could not load this Blueprint. The recorded error is: %s." % (
            data.get("error") or "unknown"
        )
    if kind == "enum":
        names = data.get("names") or []
        if names:
            shown = ", ".join(
                item.get("display") or item.get("name") or "" for item in names
            )
            return "Enumerators: %s." % shown
        return (
            "This user-defined enum is referenced by the key Blueprints. "
            "The dump stored no display names. In the graphs the value is NewEnumerator0."
        )
    if kind == "struct":
        variables = data.get("variables") or []
        if variables:
            shown = ", ".join(item.get("name") or "" for item in variables)
            return "Fields: %s." % shown
        return (
            "This user-defined struct is part of the key and weapon data. "
            "The dump stored no fields. Graphs that use it pass the struct through as a single value."
        )
    return "%s is included because it sits in the Blueprint set." % name


def summarize_asset(name, data):
    package = data.get("package") or data.get("asset_path") or ""
    kind = data.get("kind") or "asset"
    graphs = data.get("graphs") or []
    filled, empty_names = summarize_graphs(graphs)
    node_count = sum(item["nodes"] for item in filled)
    sentences = []
    if package:
        sentences.append("%s is recorded at %s." % (name, package))
    else:
        sentences.append("%s is in the Blueprint dump." % name)

    if kind in ("enum", "struct", "error") or not graphs:
        sentences.append(reference_sentence(name, data))
    else:
        if filled:
            def graph_phrase(item):
                count = item["nodes"]
                unit = "node" if count == 1 else "nodes"
                return "%s (%d %s)" % (item["name"], count, unit)

            shown = ", ".join(graph_phrase(item) for item in filled[:8])
            if len(filled) > 8:
                sentences.append(
                    "The dump has %d graphs with nodes. The first are %s, and %d more."
                    % (len(filled), shown, len(filled) - 8)
                )
            else:
                label = "graph" if len(filled) == 1 else "graphs"
                sentences.append(
                    "The dump has %d %s with nodes: %s."
                    % (len(filled), label, shown)
                )
            calls = []
            for item in filled:
                for call in item["calls"]:
                    if call not in calls:
                        calls.append(call)
                    if len(calls) == 8:
                        break
                if len(calls) == 8:
                    break
            if calls:
                sentences.append("Named steps include %s." % ", ".join(calls))
        if empty_names and not filled:
            shown = ", ".join(empty_names[:8])
            more = ""
            if len(empty_names) > 8:
                more = " and %d more" % (len(empty_names) - 8)
            sentences.append(
                "%d graphs are named and have no nodes in the dump: %s%s."
                % (len(empty_names), shown, more)
            )
        elif empty_names:
            sentences.append(
                "%d more graphs are named and have no nodes." % len(empty_names)
            )
        if not filled and not empty_names:
            sentences.append(reference_sentence(name, data))

    shown_empty = empty_names[:8]
    return {
        "name": name,
        "slug": slugify(name),
        "kind": kind,
        "package": package,
        "summary": " ".join(sentences),
        "nodeCount": node_count,
        "graphs": filled,
        "emptyGraphCount": len(empty_names),
        "emptyGraphNames": shown_empty,
    }


def load_dump(folder):
    by_name = {}
    for filename in os.listdir(folder):
        if not filename.endswith(".json"):
            continue
        path = os.path.join(folder, filename)
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        name = asset_name(data)
        if not name:
            continue
        by_name[name] = data
    return by_name


def build(folder):
    by_name = load_dump(folder)
    used = set()
    parts = []
    current = None
    graph_total = 0
    node_total = 0
    record_total = 0
    blueprint_total = 0

    def add_asset(record):
        nonlocal graph_total, node_total, record_total, blueprint_total
        record_total += 1
        if record["kind"] == "blueprint":
            blueprint_total += 1
        graph_total += len(record["graphs"]) + record["emptyGraphCount"]
        node_total += record["nodeCount"]
        return record

    for chapter in CHAPTERS:
        part = chapter.get("part")
        if part:
            current = {
                "key": part["key"],
                "title": part["title"],
                "summary": part["summary"],
                "chapters": [],
            }
            parts.append(current)
        assets = []
        for name in chapter["assets"]:
            used.add(name)
            data = by_name.get(name)
            if data is None:
                assets.append(
                    add_asset(
                        {
                            "name": name,
                            "slug": slugify(name),
                            "kind": "missing",
                            "package": "",
                            "summary": "This name is in the book and was not in the dump.",
                            "nodeCount": 0,
                            "graphs": [],
                            "emptyGraphCount": 0,
                            "emptyGraphNames": [],
                        }
                    )
                )
                continue
            assets.append(add_asset(summarize_asset(name, data)))
        current["chapters"].append(
            {
                "slug": chapter["slug"],
                "title": chapter["title"],
                "intro": chapter["intro"],
                "assets": assets,
            }
        )

    leftovers = []
    for name in sorted(by_name):
        if name in used:
            continue
        data = by_name[name]
        if data.get("kind") not in ("blueprint", "error", "enum", "struct"):
            continue
        leftovers.append(add_asset(summarize_asset(name, data)))
    if leftovers:
        parts.append(
            {
                "key": "part-other",
                "title": "Other Blueprints",
                "summary": "Assets that were in the dump and were not named in the chapters above.",
                "chapters": [
                    {
                        "slug": "other",
                        "title": "Other Blueprints",
                        "intro": "These assets were in the dump and were not named in the chapters above.",
                        "assets": leftovers,
                    }
                ],
            }
        )

    catalog = {
        "title": "Adventure Artist",
        "subtitle": "The Blueprint Book",
        "dated": "7 October 2026",
        "pdf": "/books/adventure-artist-blueprint-book.pdf",
        "preface": PREFACE,
        "stats": {
            "records": record_total,
            "blueprints": blueprint_total,
            "graphs": graph_total,
            "nodes": node_total,
            "chapters": sum(len(part["chapters"]) for part in parts),
        },
        "parts": parts,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(catalog, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(
        "records=%d blueprints=%d graphs=%d nodes=%d chapters=%d -> %s"
        % (
            record_total,
            blueprint_total,
            graph_total,
            node_total,
            catalog["stats"]["chapters"],
            OUT_PATH,
        )
    )
    if leftovers:
        print("leftovers:", ", ".join(item["name"] for item in leftovers))


if __name__ == "__main__":
    folder = os.environ.get("BOOK_DUMP", DEFAULT_DUMP)
    build(folder)
