# Top-down tutorial from the Designer and Art Pass Blueprint dumps.
# Writes the FirstTenMillion notes and web/src/data/topdown-tutorial.json.

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build_book_catalog as book

ROOT = os.path.abspath(os.path.join(HERE, ".."))
DOCS = os.path.abspath(
    os.path.join(ROOT, "..", "..", "..", "Unreal Projects", "Docs", "FirstTenMillion")
)
OUT_JSON = os.path.join(ROOT, "src", "data", "topdown-tutorial.json")
BOOK_JSON = os.path.join(ROOT, "src", "data", "blueprint-book.json")

WEAPON_WORDS = (
    "weapon",
    "shoot",
    "aim",
    "reload",
    "pistol",
    "rifle",
    "grenade",
    "projectile",
    "bullet",
    "gun",
)

EXTRA_ASSETS = ("BP_DoorFrame", "BP_JumpPad", "ABP_Unarmed")

LESSONS = [
    {
        "slug": "project-and-blockout",
        "title": "Start from the Top Down template",
        "source": "Designer 01. Project setup and level blockout",
        "summary": "Block the rooms from above, then drop in the door frame the later lessons unlock.",
        "steps": [
            "Create a Blueprint project from the Games > Top Down template. Name the map Lvl_TopDown and keep the template pawn, player controller, and game mode.",
            "The template spring arm already looks down. Set its pitch near -60 degrees and its arm length near 800 so a room reads as a floor plan. Leave Use Pawn Control Rotation off if you want the camera to stay north-up.",
            "Open the Top orthographic viewport while you block. Scale is judged on the ground plane: the pawn capsule is the width players must fit through a door.",
            "Sketch the rooms on paper first: a start room, a locked hall, a switch pit, a moving platform, a trap, and an exit. One circle per action is enough.",
            "Build floors and walls from the prototyping cube. Name floors SM_Floor and walls SM_Wall in the Outliner so the later material pass can select them in groups.",
            "Place BP_DoorFrame between rooms. Size the frame from the widget on the actor. The door logic arrives in the door lesson; the mesh is only a gate for now.",
            "Add a Nav Mesh Bounds Volume over every floor you want characters to walk. Pits stay outside the volume so enemies and the pawn cannot cross them.",
        ],
        "top_down": [
            "Do not start from the First Person template. Its camera, look input, and weapon graphs fight a top-down camera.",
            "Movement stays on XY. Jump can stay on the template pawn. Vertical rooms become pits and raised floors you see from above, not corridors you look down.",
            "Guide the player with floor color, a lit key, and the gap between rooms. Walls that hide the next room in first person only clutter a top-down view, so keep them low.",
        ],
        "assets": ["BP_DoorFrame"],
        "figures": [],
    },
    {
        "slug": "keys",
        "title": "Keys the pawn can walk over",
        "source": "Designer 02. Create a key",
        "summary": "A key map dresses the mesh in the construction script. Overlap sends the key to the pawn through an interface.",
        "steps": [
            "Add Enum_KeyType with Red, Yellow, and Blue. Add Struct_KeyData with a material and a static mesh.",
            "Create M_BasicColor: a vector parameter named Color feeds Base Color. Make three instances and override Color for red, yellow, and blue.",
            "Create BP_Key (Actor). Add a static mesh and a sphere collision that sits on the floor, wide enough to meet the pawn capsule from above.",
            "Add a Key Type variable and a Key Map (enum to Struct_KeyData). Fill the map: red cone, yellow sphere, blue cube, each with its material instance.",
            "Put fnBPLSetKey in BPL_FPGame. Inputs are a static mesh component array, the key map, and the key type. The graph finds the struct, then sets the mesh and material inside a For Each Loop.",
            "BP_Key construction script calls fnBPLSetKey so the color updates in the editor when you change Key Type.",
            "Add BPI_PlayerKeys with fnBPIAddKey (key type in, no output) and fnBPIGetKeys (held keys out). Implement it on the top-down pawn, not on a first-person character.",
            "On the pawn, Event fnBPIAddKey appends the key type to a Held Keys array. fnBPIGetKeys returns that array.",
            "On BP_Key, Event ActorBeginOverlap checks Does Object Implement Interface (BPI_PlayerKeys). If it does, message fnBPIAddKey and destroy the key.",
        ],
        "top_down": [
            "The pickup is an overlap on the floor. No line trace from a camera is required, so the same graph works with a spring arm.",
            "Keep the key mesh small and slightly above the floor so it reads against the ground material.",
        ],
        "assets": [
            "Enum_KeyType",
            "Struct_KeyData",
            "BPL_FPGame",
            "BPI_PlayerKeys",
            "BP_Key",
        ],
        "figures": [],
    },
    {
        "slug": "doors",
        "title": "Doors that open for the matching key",
        "source": "Designer 03. Open doors with keys",
        "summary": "The construction script paints the door. Overlap asks the pawn which keys it holds, then plays the door timeline.",
        "steps": [
            "Open BP_DoorFrame. Add Required Key (Enum_KeyType) and the same key map of materials, without swapping the door meshes.",
            "On the construction script, add a pin on the existing Sequence. Find the material for Required Key and set it on both door meshes.",
            "Add fnHasKey. It messages fnBPIGetKeys on the overlapping actor and checks whether Held Keys contains Required Key.",
            "On Event ActorBeginOverlap, store the other actor, require BPI_PlayerKeys, then call fnHasKey. Only the true branch plays the door timeline.",
            "Place one door per key color and a matching BP_Key in the room before it. Walk the pawn across the key, then across the threshold.",
        ],
        "top_down": [
            "The trigger is the box already on BP_DoorFrame. Make sure the pawn's capsule, not a first-person camera, is what enters that box.",
            "From above, color is the lock. Keep the frame mesh readable against the floor.",
        ],
        "assets": ["BP_DoorFrame", "BP_Key", "BPI_PlayerKeys"],
        "figures": [],
    },
    {
        "slug": "hud",
        "title": "A HUD that sits on the screen, not in the world",
        "source": "Designer 04. Player HUD",
        "summary": "WBP_PlayerHUD lists keys and health. The pawn creates it once and calls it when a key is added.",
        "steps": [
            "Create WBP_PlayerHUD with a canvas. Anchor key icons to a top corner and a health bar to the other corner so they stay put while the camera scrolls.",
            "Add fnAddKeyHUD (key type in) and fnSetHP (health in). fnAddKeyHUD switches on the key type and shows the matching image.",
            "On the pawn BeginPlay, Create Widget of WBP_PlayerHUD, Add to Viewport, and store the reference.",
            "After Event fnBPIAddKey appends the key, call fnAddKeyHUD on that widget with the same key type.",
        ],
        "top_down": [
            "Screen-space widgets ignore the spring arm. Do not draw the key list as world text above the pawn or it will spin with the camera.",
        ],
        "assets": ["WBP_PlayerHUD", "BP_Key"],
        "figures": [],
    },
    {
        "slug": "switches-and-cubes",
        "title": "Floor switches and a cube",
        "source": "Designer 05. Puzzles, switches, and cubes",
        "summary": "A switch paints itself on, then messages every actor in its list through BPI_Interaction.",
        "steps": [
            "Create BPI_Interaction with fnBPISwitchOn and fnBPISwitchOff. No outputs, so they show up as events on anything that implements the interface.",
            "BP_Switch holds an Interact Object List. The construction script assigns the off material. Begin overlap sets the on material and messages fnBPISwitchOn to each actor. End overlap reverses it, unless you want the switch to latch.",
            "BP_Cube implements the interface if a switch should spawn or release it. A cube on a top-down floor needs collision that the pawn can push, or a switch that enables physics.",
            "Place the switch where the pawn must stand. The overlap volume is flat on the floor, larger than the pawn capsule.",
        ],
        "top_down": [
            "A floor switch is the natural top-down verb. The player sees the whole link from switch to cube, so keep that link short and visible.",
        ],
        "assets": ["BPI_Interaction", "BP_Switch", "BP_Cube"],
        "figures": [],
    },
    {
        "slug": "platforms",
        "title": "Platforms that move on the floor plan",
        "source": "Designer 06. Moving platforms",
        "summary": "A timeline lerps the platform between a start point and a marker. The switch interface plays and reverses it.",
        "steps": [
            "BP_Platform implements BPI_Interaction. fnBPISwitchOn plays timeline TM_MovePlatform. fnBPISwitchOff reverses it.",
            "The timeline drives a lerp from the platform start location to the target point, then sets the actor location.",
            "BP_Platform_Dot is the marker you place in the level for that target. Put it on the same height as the platform so the move stays horizontal and readable from above.",
            "Add the platform actor to the switch Interact Object List.",
        ],
        "top_down": [
            "Prefer moves across the floor or over a pit the camera can see in one frame. A platform that rises straight at the camera is hard to read.",
        ],
        "assets": ["BP_Platform", "BP_Platform_Dot", "BP_Switch"],
        "figures": [],
    },
    {
        "slug": "traps",
        "title": "Traps and damage",
        "source": "Designer 07. Traps and damage",
        "summary": "BP_TrapBase applies damage. Fire and spikes are the two children. A jump pad is the optional escape.",
        "steps": [
            "On the pawn, add Health and Max Health. A damage function subtracts, calls fnSetHP on the HUD, and opens the eliminated screen at zero.",
            "BP_TrapBase exposes fnApplyDamageToTarget. Children call it when their overlap or timeline says the trap is hot.",
            "BP_TrapFire and BP_TrapSpikes are those children. Place them in pits so the pawn must route around them on the nav mesh.",
            "BP_JumpPad launches whoever overlaps it. On a top-down map it is a way across a pit, using the template jump velocity.",
        ],
        "top_down": [
            "Telegraph traps with floor color and emissive meshes. The player can see the whole hazard at once, so the timing has to be readable from above.",
        ],
        "assets": ["BP_TrapBase", "BP_TrapFire", "BP_TrapSpikes", "BP_JumpPad"],
        "figures": [],
    },
    {
        "slug": "enemy",
        "title": "An enemy that patrols the floor",
        "source": "Designer 08. Create an enemy",
        "summary": "BP_Enemy is the opposing character. Keep its damage and move logic. Replace any camera trace with a check on the floor.",
        "steps": [
            "Use a character with the mannequin mesh and ABP_Unarmed. A top-down enemy does not need the first-person weapon anim blueprint.",
            "Cover the walkable floor with a nav mesh. Give the enemy a few target points and call AI Move To between them.",
            "Sight is a radius on XY, or a forward dot product on the floor plane. If the dump graph starts a line trace at a camera, retarget that trace to the enemy actor's eyes along its forward vector.",
            "When the player is inside the radius, move to the player and apply damage through the same health function the traps use.",
        ],
        "top_down": [
            "The player can see the enemy's whole path. Short patrols around a corner of walls still surprise if the walls are tall enough to hide the mesh.",
        ],
        "assets": ["BP_Enemy", "ABP_Unarmed"],
        "figures": [],
    },
    {
        "slug": "sprint",
        "title": "Sprint on the top-down pawn",
        "source": "Designer 09. Sprint, and the player graphs worth keeping",
        "summary": "Copy keys, health, and the HUD from the adventure character. Leave its weapon graphs behind. Sprint only changes walk speed.",
        "steps": [
            "Add IA_Sprint to the top-down mapping context.",
            "On Started, set Max Walk Speed to the run speed. On Completed, set it back to the walk speed. ABP_Unarmed already blends on speed, so the mannequin runs without a new state.",
            "Rotate the pawn to its velocity on yaw only: if speed is above a small threshold, Find Look at Rotation toward location plus velocity, then interp yaw. The spring arm does not have to yaw with the mesh.",
            "From BP_AdventureCharacter, keep the key interface events, the health and HUD calls, and the sprint speed change. Skip every graph whose name is a weapon, aim, or projectile.",
        ],
        "top_down": [
            "The adventure character was built on the first-person shooter sample. Its look and shoot graphs assume a camera at the eyes. The top-down template pawn already moves on a plane. Add behavior to that pawn.",
        ],
        "assets": ["BP_AdventureCharacter", "ABP_Unarmed"],
        "skip_weapons": True,
        "figures": [],
    },
    {
        "slug": "finish-the-level",
        "title": "Win, lose, and leave the level",
        "source": "Designer 10 and 11. Complete the level, and spawn another cube",
        "summary": "An overlap opens the win screen and loads the next map. Health at zero opens the eliminated screen. A spawner replaces cubes the player spends.",
        "steps": [
            "BP_LevelTransition overlaps the pawn, shows WBP_WinScreen, and opens the next level.",
            "WBP_EliminatedScreen is the fail state the health function opens. Give both widgets a button that reloads the current map.",
            "BP_CubeSpawn is the art-track spawner. Call it from a switch when the puzzle needs a fresh cube.",
            "Walk the whole loop from the start room to the exit once with one key, one switch, one trap, and one enemy.",
        ],
        "top_down": [
            "Put the exit on the floor where the camera already looks. A transition volume the height of the pawn is enough.",
        ],
        "assets": [
            "BP_LevelTransition",
            "WBP_WinScreen",
            "WBP_EliminatedScreen",
            "BP_CubeSpawn",
            "BP_Keyport",
        ],
        "figures": [],
    },
    {
        "slug": "materials",
        "title": "Materials that read from above",
        "source": "Art Pass 03 and 04. Materials, instances, and a wet floor",
        "summary": "One parent material, instances for floor and tile, then a dynamic instance that a water actor can wet.",
        "steps": [
            "Build M_Surfaces. A texture sample's RGB, multiplied by a vector parameter Diffuse Hue, feeds Base Color. A scalar Roughness feeds Roughness. A scalar UV Tiling multiplies the texture coordinate.",
            "Create MI_Surfaces_Floor and MI_Surfaces_Tile. Override UV Tiling so large floors do not stretch. Apply them to the blockout floors.",
            "For floors that meet at different scales, replace the texture coordinate with a world-aligned texture so the pattern stays put when you move BP_Floor.",
            "BP_Floor is a cube static mesh using MI_Surfaces_Floor. On begin play, Create Dynamic Material Instance on that mesh and store it.",
            "BP_WaterBall overlaps BP_Floor. The floor checks the other actor's class, then sets Roughness low and shifts Diffuse Hue. End overlap restores the dry values.",
            "M_Emissive is a constant into Emissive Color, used on thin columns so keys and doors stay findable.",
        ],
        "top_down": [
            "The camera sees large floor areas, so tiling and hue do more work than normal-map detail.",
            "World-aligned UVs keep a platform and a nearby floor on the same grid while the platform moves.",
        ],
        "assets": ["BP_Switch_ArtTrack"],
        "figures": [
            {
                "label": "M_Surfaces",
                "graph": {
                    "name": "Material",
                    "nodes": 7,
                    "calls": ["TextureSample", "Multiply", "Diffuse Hue", "Roughness", "UV Tiling"],
                    "picture": {
                        "nodes": [
                            {"id": "uv", "title": "TexCoord * UV Tiling", "kind": "pure", "x": 0, "y": 0},
                            {"id": "tex", "title": "Texture Sample", "kind": "pure", "x": 1, "y": 0},
                            {"id": "hue", "title": "Diffuse Hue", "kind": "variable", "x": 1, "y": 80},
                            {"id": "mul", "title": "Multiply", "kind": "pure", "x": 2, "y": 0},
                            {"id": "rough", "title": "Roughness", "kind": "variable", "x": 2, "y": 80},
                            {"id": "root", "title": "M_Surfaces", "kind": "function", "x": 3, "y": 0},
                        ],
                        "wires": [
                            {"from": "uv", "to": "tex", "kind": "data"},
                            {"from": "tex", "to": "mul", "kind": "data"},
                            {"from": "hue", "to": "mul", "kind": "data"},
                            {"from": "mul", "to": "root", "kind": "data"},
                            {"from": "rough", "to": "root", "kind": "data"},
                        ],
                    },
                },
            },
            {
                "label": "BP_Floor wet look",
                "graph": {
                    "name": "EventGraph",
                    "nodes": 5,
                    "calls": ["ActorBeginOverlap", "Equal", "Set Scalar Parameter", "Set Vector Parameter"],
                    "picture": {
                        "nodes": [
                            {"id": "ov", "title": "Actor Begin Overlap", "kind": "event", "x": 0, "y": 0},
                            {"id": "eq", "title": "Equal BP_WaterBall", "kind": "pure", "x": 1, "y": 0},
                            {"id": "br", "title": "Branch", "kind": "flow", "x": 2, "y": 0},
                            {"id": "wet", "title": "Call Wet Look", "kind": "call", "x": 3, "y": 0},
                            {"id": "set", "title": "Set Roughness and Hue", "kind": "set", "x": 4, "y": 0},
                        ],
                        "wires": [
                            {"from": "ov", "to": "eq", "kind": "data"},
                            {"from": "eq", "to": "br", "kind": "data"},
                            {"from": "ov", "to": "br", "kind": "exec"},
                            {"from": "br", "to": "wet", "kind": "exec"},
                            {"from": "wet", "to": "set", "kind": "exec"},
                        ],
                    },
                },
            },
        ],
    },
    {
        "slug": "light-and-post",
        "title": "Light, post process, and a damage flash",
        "source": "Art Pass 02, 05, 06, and 07",
        "summary": "Local lights pick out keys and doors. A post-process volume sets the top-down grade. A material on the HUD flashes when the pawn takes damage.",
        "steps": [
            "Place a directional light for the whole floor and a point light or rect light on each key and door. From above, a pool of light is a landmark.",
            "Add an unbound post-process volume. Set exposure, contrast, and a slight vignette. Keep bloom low so emissive keys stay sharp.",
            "Build a post-process material that blends toward red with a scalar Damage Amount. Assign it to the volume blendables.",
            "When the pawn takes damage, set that scalar through a dynamic material instance, then interp it back to zero. Drive it from the HUD or the pawn, not from the camera.",
            "Lumen and virtual shadow maps still apply. Large outdoor floors are where they cost the most, so profile the top-down view before you raise quality.",
        ],
        "top_down": [
            "The volume must cover the play space or be unbound. A room-sized volume that worked in first person can miss the spring-arm camera.",
        ],
        "assets": [],
        "figures": [
            {
                "label": "Damage flash",
                "graph": {
                    "name": "Post process",
                    "nodes": 4,
                    "calls": ["SceneTexture", "Lerp", "Damage Amount"],
                    "picture": {
                        "nodes": [
                            {"id": "scene", "title": "Scene Texture", "kind": "pure", "x": 0, "y": 0},
                            {"id": "red", "title": "Damage Color", "kind": "variable", "x": 0, "y": 80},
                            {"id": "amt", "title": "Damage Amount", "kind": "variable", "x": 1, "y": 80},
                            {"id": "lerp", "title": "Lerp", "kind": "pure", "x": 2, "y": 0},
                        ],
                        "wires": [
                            {"from": "scene", "to": "lerp", "kind": "data"},
                            {"from": "red", "to": "lerp", "kind": "data"},
                            {"from": "amt", "to": "lerp", "kind": "data"},
                        ],
                    },
                },
            }
        ],
    },
    {
        "slug": "sound",
        "title": "Fire, music, and footsteps",
        "source": "Art Pass 08, 09, and 10",
        "summary": "The fire trap plays a sound at the actor. A MetaSound makes the bed. Footsteps pick a wave from the physical material under the pawn.",
        "steps": [
            "On the fire trap, play a looping sound at the trap location while it is hot, and stop it when the trap cools. Attenuation matters more in top-down because the camera is far from the mesh: set the falloff so a trap you can see is a trap you can hear.",
            "Create MS_BGM. Input triggers a Trigger Repeat. Period comes from BPM To Seconds at a 16th note. Promote BPM to an input named Note In, default 60. Repeat Out feeds a Trigger Counter that resets at 8.",
            "On Trigger and On Reset, Random Get (float array) reads a Scale to Note Array. Promote the scale degrees. Add a Random Int reseed on reset. Add an offset, run the note through a synth, and connect that to Out Mono.",
            "BP_BGM is an actor you place once in the level. Begin Play starts MS_BGM. The graph does not depend on the camera.",
            "BP_DA_Footsteps maps a physical material to a sound. The pawn line-traces down, not forward, and plays the matching wave. Down is the right direction for a top-down pawn.",
        ],
        "top_down": [
            "A downward trace for footsteps already matches a top-down pawn. Do not reuse a first-person trace that starts at the camera.",
        ],
        "assets": ["BP_BGM", "BP_DA_Footsteps", "BP_TrapFire_ArtTrack"],
        "figures": [
            {
                "label": "MS_BGM clock",
                "graph": {
                    "name": "MetaSound",
                    "nodes": 6,
                    "calls": ["Trigger Repeat", "BPM To Seconds", "Trigger Counter", "Random Get"],
                    "picture": {
                        "nodes": [
                            {"id": "in", "title": "Input", "kind": "event", "x": 0, "y": 0},
                            {"id": "rep", "title": "Trigger Repeat", "kind": "call", "x": 1, "y": 0},
                            {"id": "bpm", "title": "BPM To Seconds", "kind": "pure", "x": 1, "y": 80},
                            {"id": "ctr", "title": "Trigger Counter", "kind": "call", "x": 2, "y": 0},
                            {"id": "rnd", "title": "Random Get", "kind": "call", "x": 3, "y": 0},
                            {"id": "out", "title": "Out Mono", "kind": "function", "x": 4, "y": 0},
                        ],
                        "wires": [
                            {"from": "in", "to": "rep", "kind": "exec"},
                            {"from": "bpm", "to": "rep", "kind": "data"},
                            {"from": "rep", "to": "ctr", "kind": "exec"},
                            {"from": "ctr", "to": "rnd", "kind": "exec"},
                            {"from": "rnd", "to": "out", "kind": "data"},
                        ],
                    },
                },
            }
        ],
    },
    {
        "slug": "vfx-and-package",
        "title": "Niagara on the traps, then package",
        "source": "Art Pass 11 and 12",
        "summary": "A Niagara system sits on the fire trap. The art-track trap graphs set a float on it. Then you cook a Windows build.",
        "steps": [
            "Create a Niagara system in the artist VFX folder. Start from a simple emitter such as hanging particulates, raise the spawn rate, and duplicate that idea for a fire emitter on the trap.",
            "Add a Niagara component to the fire trap. BP_TrapFire_ArtTrack gets that component and calls Set Niagara Variable by String so gameplay can turn the flame up and down.",
            "BP_TrapSpikes_ArtTrack and BP_Switch_ArtTrack are the dressed versions of the designer actors. Use them once the blockout logic is done.",
            "BP_RoomLogo, BP_00, BP_02, and BP_03 mark rooms on the floor plan. In top-down they can lie flat on the floor as labels.",
            "Package for Windows from the Top Down game mode and Lvl_TopDown as the default map. Include the starter content the materials reference.",
        ],
        "top_down": [
            "Sprite and mesh particles should face the camera or lie on the floor. A first-person flame column can hide the pawn if it is too tall.",
        ],
        "assets": [
            "BP_TrapFire_ArtTrack",
            "BP_TrapSpikes_ArtTrack",
            "BP_Switch_ArtTrack",
            "BP_RoomLogo",
            "BP_00",
            "BP_02",
            "BP_03",
        ],
        "figures": [],
    },
]


def book_hrefs():
    if not os.path.isfile(BOOK_JSON):
        return {}
    with open(BOOK_JSON, "r", encoding="utf-8") as handle:
        catalog = json.load(handle)
    hrefs = {}
    for part in catalog.get("parts") or []:
        for chapter in part.get("chapters") or []:
            for asset in chapter.get("assets") or []:
                hrefs[asset["name"]] = "/book/%s/%s" % (chapter["slug"], asset["slug"])
    return hrefs


def is_weapon_graph(name):
    lowered = (name or "").lower()
    return any(word in lowered for word in WEAPON_WORDS)


def node_titles(graph):
    titles = []
    for node in graph.get("nodes") or []:
        if book.skip_visual(node):
            continue
        title = book.node_title(node)
        titles.append(title)
    return titles


def exec_lines(graph, limit=24):
    nodes = graph.get("nodes") or []
    by_id = {}
    for node in nodes:
        nid = node.get("id")
        if nid:
            by_id[nid] = node
    lines = []
    for node in nodes:
        if book.skip_visual(node):
            continue
        title = book.node_title(node)
        for pin in node.get("pins") or []:
            if (pin.get("type") or "") != "Exec":
                continue
            if "OUTPUT" not in (pin.get("direction") or ""):
                continue
            targets = []
            for dst in book.follow_targets(pin, by_id, {node.get("id")}):
                other = by_id.get(dst)
                if other is None:
                    continue
                label = book.node_title(other)
                if label not in targets:
                    targets.append(label)
            if not targets:
                continue
            pin_name = pin.get("name") or "then"
            lines.append("%s [%s] -> %s" % (title, pin_name, ", ".join(targets)))
            if len(lines) >= limit:
                return lines
    return lines


def write_graph_md(name, data, folder, top_down_note):
    path = os.path.join(folder, "%s.md" % book.slugify(name))
    package = data.get("package") or data.get("asset_path") or ""
    kind = data.get("kind") or "asset"
    lines = [
        "# %s" % name,
        "",
        "Kind: %s" % kind,
        "",
        "Package: `%s`" % package,
        "",
        top_down_note,
        "",
    ]
    if kind == "error":
        lines.append("The dump could not load this asset. %s" % (data.get("error") or ""))
        lines.append("")
    graphs = data.get("graphs") or []
    if not graphs and kind in ("enum", "struct"):
        lines.append(book.reference_sentence(name, data))
        lines.append("")
    for graph in graphs:
        gname = graph.get("name") or "Graph"
        titles = node_titles(graph)
        lines.append("## %s" % gname)
        lines.append("")
        if is_weapon_graph(gname):
            lines.append(
                "Skip this graph on a top-down pawn. It belongs to the first-person weapon setup."
            )
            lines.append("")
        lines.append("%d nodes." % len(titles))
        lines.append("")
        if titles:
            lines.append("Nodes:")
            lines.append("")
            for title in titles:
                lines.append("- %s" % title)
            lines.append("")
        flow = exec_lines(graph)
        if flow:
            lines.append("Execution:")
            lines.append("")
            for item in flow:
                lines.append("- %s" % item)
            lines.append("")
    text = "\n".join(lines).rstrip() + "\n"
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def slim_graph(item, picture_limit=14):
    picture = item.get("picture")
    count = len((picture or {}).get("nodes") or [])
    slim = {
        "name": item["name"],
        "nodes": item["nodes"],
        "calls": item["calls"],
    }
    if picture and 2 <= count <= picture_limit:
        slim["picture"] = picture
    return slim


def asset_record(name, data, hrefs, skip_weapons):
    if data is None:
        return {
            "name": name,
            "slug": book.slugify(name),
            "kind": "missing",
            "package": "",
            "bookHref": hrefs.get(name),
            "graphs": [],
        }
    summary = book.summarize_asset(name, data)
    graphs = []
    for item in summary["graphs"]:
        if skip_weapons and is_weapon_graph(item["name"]):
            continue
        graphs.append(slim_graph(item))
    return {
        "name": name,
        "slug": summary["slug"],
        "kind": summary["kind"],
        "package": summary["package"],
        "bookHref": hrefs.get(name),
        "graphs": graphs,
    }


def pick_figures(assets, hand_figures, limit=3):
    figures = list(hand_figures)
    if len(figures) >= limit:
        return figures[:limit]
    for asset in assets:
        for graph in asset["graphs"]:
            if not graph.get("picture"):
                continue
            figures.append(
                {
                    "label": "%s · %s" % (asset["name"], graph["name"]),
                    "graph": graph,
                }
            )
            if len(figures) >= limit:
                return figures
    return figures


def lesson_markdown(lesson, assets):
    lines = [
        "# %d. %s" % (lesson["number"], lesson["title"]),
        "",
        "Source notes: %s." % lesson["source"],
        "",
        lesson["summary"],
        "",
        "## Steps",
        "",
    ]
    for index, step in enumerate(lesson["steps"], start=1):
        lines.append("%d. %s" % (index, step))
    lines.append("")
    lines.append("## Top-down")
    lines.append("")
    for note in lesson["top_down"]:
        lines.append("- %s" % note)
    lines.append("")
    lines.append("## Graphs")
    lines.append("")
    if not assets:
        lines.append("This lesson is a material, light, or audio graph. The node chain is in the steps above.")
        lines.append("")
    for asset in assets:
        lines.append("### %s" % asset["name"])
        lines.append("")
        if asset.get("bookHref"):
            lines.append("Book page: `%s`" % asset["bookHref"])
            lines.append("")
        if asset["kind"] == "missing":
            lines.append("Not in the dump.")
            lines.append("")
            continue
        if not asset["graphs"]:
            lines.append("No filled graphs, or only weapon graphs, which a top-down pawn skips.")
            lines.append("")
            continue
        for graph in asset["graphs"]:
            calls = ", ".join(graph["calls"]) if graph["calls"] else "no named calls"
            lines.append("- **%s** (%d nodes): %s" % (graph["name"], graph["nodes"], calls))
        lines.append("")
        lines.append("Full node lists: `graphs/%s.md`." % asset["slug"])
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main():
    folder = os.environ.get("BOOK_DUMP", book.DEFAULT_DUMP)
    by_name = book.load_dump(folder)
    hrefs = book_hrefs()
    os.makedirs(os.path.join(DOCS, "graphs"), exist_ok=True)
    os.makedirs(os.path.join(DOCS, "tutorial"), exist_ok=True)

    wanted = []
    for lesson in LESSONS:
        for name in lesson["assets"]:
            if name not in wanted:
                wanted.append(name)
    for name, data in sorted(by_name.items()):
        package = data.get("package") or ""
        if "/AdventureGame/" in package and name not in wanted:
            wanted.append(name)
    for name in EXTRA_ASSETS:
        if name not in wanted:
            wanted.append(name)

    note = (
        "These node titles come from the editor dump of the Designer and Art Pass project. "
        "Use the graphs that move, overlap, and play on the floor. Skip graphs that aim a camera or fire a weapon."
    )
    for name in wanted:
        data = by_name.get(name)
        if data is None:
            missing_path = os.path.join(DOCS, "graphs", "%s.md" % book.slugify(name))
            with open(missing_path, "w", encoding="utf-8", newline="\n") as handle:
                handle.write("# %s\n\nNot in the dump.\n" % name)
            continue
        write_graph_md(name, data, os.path.join(DOCS, "graphs"), note)

    lessons_out = []
    graph_total = 0
    blueprint_names = []
    for index, lesson in enumerate(LESSONS, start=1):
        lesson = dict(lesson)
        lesson["number"] = index
        skip = bool(lesson.get("skip_weapons"))
        assets = [
            asset_record(name, by_name.get(name), hrefs, skip) for name in lesson["assets"]
        ]
        for asset in assets:
            graph_total += len(asset["graphs"])
            if asset["name"] not in blueprint_names:
                blueprint_names.append(asset["name"])
        figures = pick_figures(assets, lesson.get("figures") or [])
        record = {
            "slug": lesson["slug"],
            "number": index,
            "title": lesson["title"],
            "source": lesson["source"],
            "summary": lesson["summary"],
            "steps": lesson["steps"],
            "topDown": lesson["top_down"],
            "assets": assets,
            "figures": figures,
        }
        lessons_out.append(record)
        path = os.path.join(DOCS, "tutorial", "%02d-%s.md" % (index, lesson["slug"]))
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(lesson_markdown(lesson, assets))

    readme = [
        "# First Ten Million",
        "",
        "Top-down reading of the Designer track and the Art Pass.",
        "",
        "The gameplay that overlaps, unlocks, moves, damages, and plays audio works with a spring-arm camera. The first-person look and weapon graphs do not. Each file under `graphs/` lists the nodes in that Blueprint. Each file under `tutorial/` is one lesson.",
        "",
        "The same lessons are published at https://ottegames.vercel.app/tutorial.",
        "",
        "## Lessons",
        "",
    ]
    for lesson in lessons_out:
        readme.append(
            "%d. [%s](tutorial/%02d-%s.md) — %s"
            % (lesson["number"], lesson["title"], lesson["number"], lesson["slug"], lesson["summary"])
        )
    readme.append("")
    readme.append("## Blueprints and graphs")
    readme.append("")
    for name in wanted:
        readme.append("- [%s](graphs/%s.md)" % (name, book.slugify(name)))
    readme.append("")
    with open(os.path.join(DOCS, "README.md"), "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(readme))

    payload = {
        "title": "First Ten Million",
        "subtitle": "Top-down puzzle adventure",
        "dated": "7 October 2026",
        "intro": [
            "Build the puzzle adventure from the Top Down template. Keys, doors, switches, platforms, traps, and the HUD do not care where the camera sits. Aiming and weapons do, so those graphs stay in the first-person book.",
            "Node pictures on these pages are the graphs from the Designer and Art Pass dumps, plus the material, MetaSound, and post-process chains those lessons describe. A picture is drawn when the graph is small enough to read. Larger graphs open in the Blueprint Book.",
        ],
        "stats": {
            "lessons": len(lessons_out),
            "blueprints": len(blueprint_names),
            "graphs": graph_total,
        },
        "lessons": lessons_out,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(
        "lessons=%d blueprints=%d graphs=%d docs=%s json=%s"
        % (len(lessons_out), len(blueprint_names), graph_total, DOCS, OUT_JSON)
    )


if __name__ == "__main__":
    main()
