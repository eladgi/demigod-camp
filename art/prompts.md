# Nano Banana prompts: round 2 (new words + labyrinth)

Save everything in `art\raw\` with exactly these file names.
For the hero and the Minotaur, **upload a reference image** before pasting the prompt.

---

## 1. `icons_grid_2.jfif`, 1:1 (the new words)
> A 4x4 grid sprite sheet of 16 separate game icons, in a stylized 2D cartoon game art style with bold clean dark outlines, cel shading and rich bright colors, matching a Greek-mythology adventure game for kids. Each icon is centered in its own equal square cell with generous empty space around it, and nothing crosses into another cell. Row 1: a brown bear, a white rabbit, a monkey, a grey elephant. Row 2: a slice of pizza, an ice cream cone, a white egg, an orange carrot. Row 3: a hat, a sneaker shoe, an open umbrella, an alarm clock. Row 4: a red car, a sailing boat, an airplane, a yellow school bus. Each object is shown whole, simple and instantly recognizable, without extra decorations or wings. Plain solid bright green background (#00FF00) everywhere, no grid lines, no text, no shadows on the background.

## 2. `objects_grid.jfif`, 1:1 (labyrinth objects)
> A 4x4 grid sprite sheet of 16 separate game objects for a top-down Greek-labyrinth adventure game, in a stylized 2D cartoon game art style with bold clean dark outlines, cel shading and rich colors, seen from the front with a slight top-down angle. Each object is centered in its own equal square cell with empty space around it, nothing crossing into another cell. Row 1: a shiny gold coin with a Greek owl stamp, a sparkling blue gem, a closed wooden treasure chest, an open empty wooden treasure chest. Row 2: a plain pure-white key (no other colors on it), a rolled papyrus scroll, a Greek clay amphora vase, a small stone owl statue. Row 3: a golden key, a heavy wooden door with iron studs (front view, rectangular), a golden ornate door (front view, rectangular), stone stairs going down into a dark opening. Row 4: a wooden table with four legs, a white marble Greek column, a small olive tree in a clay pot, a burning wall torch. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows on the background.

## 3. Hero walking: **3 separate images**, 1:1 each. Upload `hero_test.jfif` as reference every time
Only 3 are needed: walking left is the mirror image of walking right.
Ask for one image at a time, in the same Gemini chat, so it keeps the character.

**`hero_walk_down.jfif`**
> Using this exact character (same face, braid, white tunic, gold belt, bronze shield and sword, same colors and art style), draw a 2x2 grid of 4 frames of her walking TOWARD the camera, seen from slightly above. Frame 1: left foot forward. Frame 2: feet together. Frame 3: right foot forward. Frame 4: feet together. Same size and position in every frame, full body, each frame centered in its own quarter of the image, nothing crossing into another quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

**`hero_walk_right.jfif`** (version 2: the first try had 4 almost identical frames)
> Same character, same style. A 2x2 grid showing 4 CLEARLY DIFFERENT poses of a walk cycle, side view facing right, like an animation reference sheet. Frame 1 (top-left): big stride, LEFT leg far forward and right leg far back, right arm swinging forward. Frame 2 (top-right): passing pose, legs together, the back foot lifted off the ground, body slightly higher. Frame 3 (bottom-left): big stride, RIGHT leg far forward and left leg far back, left arm swinging forward. Frame 4 (bottom-right): passing pose, legs together, the other foot lifted, body slightly higher. Exaggerate the leg and arm movement so every frame looks different. Same size and same position in every frame, full body, each frame centered in its own quarter of the image. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

**`hero_walk_left.jfif`** (optional, so the shield stays on the correct arm when she walks left)
> Same character, same style, the same 4 walk-cycle poses as before but walking to the LEFT, side view facing left, with the shield still on her left arm and the sword in her right hand. Frame 1: big stride, left leg forward. Frame 2: passing pose, back foot lifted. Frame 3: big stride, right leg forward. Frame 4: passing pose, other foot lifted. Exaggerated movement, same size and position in every frame, each frame centered in its own quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

**`hero_walk_up.jfif`**
> Same character, same style. Draw a 2x2 grid of 4 frames of her walking AWAY from the camera, back view (we see her back, braid and shield), seen from slightly above. Frame 1: left foot forward. Frame 2: feet together. Frame 3: right foot forward. Frame 4: feet together. Same size and position in every frame, full body, each frame centered in its own quarter of the image, nothing crossing into another quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

If the 2x2 grid still comes out wrong, ask for just **one pose** per direction instead (same file names). The game handles that too, with a simpler bouncing walk.

## 4. Minotaur walking: **3 separate images**, 1:1 each
First make `minotaur_walk_down.jfif`, then upload it as the reference for the other two.

**`minotaur_walk_down.jfif`**
> A Minotaur for a top-down kids' adventure game: a big muscular half-bull half-man with brown fur, curved horns, a bronze nose ring and a short Greek kilt. Scary but fun, cartoon style for kids, bold clean dark outlines, cel shading, rich colors. Draw a 2x2 grid of 4 frames of him stomping TOWARD the camera, seen from slightly above. Frame 1: left foot forward. Frame 2: feet together. Frame 3: right foot forward. Frame 4: feet together. Same size and position in every frame, full body, each frame centered in its own quarter, nothing crossing into another quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

**`minotaur_walk_right.jfif`**: upload `minotaur_walk_down.jfif`
> Same Minotaur, same style. A 2x2 grid of 4 frames of him stomping to the RIGHT, side view facing right, seen from slightly above. Frame 1: left foot forward. Frame 2: feet together. Frame 3: right foot forward. Frame 4: feet together. Same size and position in every frame, full body, each frame centered in its own quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

**`minotaur_walk_up.jfif`**: upload `minotaur_walk_down.jfif`
> Same Minotaur, same style. A 2x2 grid of 4 frames of him stomping AWAY from the camera, back view, seen from slightly above. Frame 1: left foot forward. Frame 2: feet together. Frame 3: right foot forward. Frame 4: feet together. Same size and position in every frame, full body, each frame centered in its own quarter. Plain solid bright green background (#00FF00), no grid lines, no text, no shadows.

## 5. `minotaur_sleep.jfif`, 1:1. Upload `minotaur_walk_down.jfif` as reference
> The same Minotaur character, sitting on the floor fast asleep: leaning back, eyes closed, mouth open snoring, arms crossed. Same colors and art style, seen from a 3/4 top-down angle, full body, centered. Plain solid bright green background (#00FF00), no text, no "Zzz", no shadows.

## 6. `ariadne.jfif`, 1:1 (Ariadne portrait for the speech bubble)
> A friendly portrait of Ariadne, a young Greek princess, head and shoulders, smiling warmly at the viewer, dark curly hair with a golden headband, holding a glowing golden thread, in a stylized 2D cartoon game art style with bold clean dark outlines and cel shading, matching a Greek-mythology adventure game for kids. Centered, filling most of the square. Plain solid bright green background (#00FF00), no text.

## 7. Optional: floor and wall tiles, both 1:1
**`floor_tile.jfif`**
> A seamless tileable top-down texture of an ancient Greek labyrinth floor: warm sandy stone slabs with thin cracks, flat even lighting, stylized cartoon game style, no objects, no shadows, the edges must tile perfectly.

**`wall_tile.jfif`**
> A seamless tileable top-down texture of the top of an ancient stone labyrinth wall: dark brown-grey stone blocks seen from above with a lighter top edge, flat even lighting, stylized cartoon game style, no objects, the edges must tile perfectly.
