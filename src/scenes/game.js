import k from "../kaplayCtx";
import { makeSonic } from "../entities/sonic";
import { makeMotobug } from "../entities/motobug";
import { makeRing } from "../entities/ring"

export default function game(){
    k.setGravity(3100);
    const citySfx = k.play("city", { volume: 0.5, loop: true });

    const scoreText = k.add([
        k.text("SCORE : 0", { font: "mania", size: 72 }),
        k.pos(20,20)
    ]);

    const bgPieceWidth = 1920;
    const bgPieces = [
        k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
        k.add([
            k.sprite("chemical-bg"), 
            k.pos(bgPieceWidth, 0), 
            k.scale(2), 
            k.opacity(0.8),
        ]),
    ];

    const platformWidth = 1280;
    const platforms = [
        k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
        k.add([k.sprite("platforms"), k.pos(platformWidth, 450), k.scale(4)])
    ];

    let score = 0;
    let scoreMultiplier = 0;

    /* Destroy enemeny when sonic jumps on it, +1 score, score multiplier */
    const sonic = makeSonic(k.vec2(200, 745));
    sonic.setControls();
    sonic.setEvents();
    sonic.onCollide("enemy", (enemy) => {
        if(!sonic.isGrounded()){
            k.play("destroy", {volume:0.5});
            k.play("hyper-ring", {volume: 0.5});
            k.destroy(enemy);
            sonic.play("jump");
            sonic.jump();
            scoreMultiplier += 1;
            score += 10 * scoreMultiplier;
            scoreText.text = `SCORE : ${score}`;
            if (scoreMultiplier === 1) sonic.ringCollectUI.text = "+10";
            if (scoreMultiplier > 1) sonic.ringCollectUI.text = `x${scoreMultiplier}`;
            k.wait(1, () => {sonic.ringCollectUI.text = ""});
            return;
        }

        k.play("hurt", {volume: 0.5});
        k.setData("current-score", score)
        k.go("gameover", { citySfx });
    });
    /* ========== ========== ========== */

    /* Score +1 when ring is collected */
    sonic.onCollide("ring", (ring) => {
        k.play("ring", {volume: 0.5});
        k.destroy(ring);
        score++;
        scoreText.text = `SCORE : ${score}`
        sonic.ringCollectUI.text = "+1";
        k.wait(1, () => sonic.ringCollectUI.text = "")
    });
    /* ========== ========== ========== */


    let gameSpeed = 300;
    k.loop(1, () => {
        gameSpeed += 50;
    });

    /* Motobug movements */
    const spawnMotoBug = () => {
        const motobug = makeMotobug(k.vec2(1950, 773));
        motobug.onUpdate(() => {
            if (gameSpeed < 3000) {
                motobug.move(-(gameSpeed + 300), 0);
                return;
            }
    /* ========== ========== ========== */

            motobug.move(-gameSpeed, 0);
        });
        /* Destroys MotoBug when offscreen */
        motobug.onExitScreen(() => {
            if (motobug.pos.x < 0) k.destroy(motobug);
        });
        /* Spawning infinite MotoBug*/
        const waitTime = k.rand(0.5, 2.5)
        k.wait(waitTime, spawnMotoBug)
    };
    spawnMotoBug();
        /* ========== ========== ========== */

        /* Spawning infinite Rings*/
        const spawnRing = () => {
            const ring = makeRing(k.vec2(1950, 745))
            ring.onUpdate(() =>{
            ring.move(-gameSpeed, 0);
            });
            ring.onExitScreen(() => {
                if (ring.pos.x < 0) k.destroy(ring);
            });

            const waitTime = k.rand(0.5, 3);
            k.wait(waitTime, spawnRing);
        };
        spawnRing();
         /* ========== ========== ========== */


    /* Adding invisible platform on which sonic runs*/
    k.add([
        k.rect(1920, 300),
        k.opacity(0),
        k.area(),
        k.pos(0, 832),
        k.body({isStatic: true}),
    ]);
    /* ========== ========== ========== */
    

    k.onUpdate(() => {
        if(sonic.isGrounded()) scoreMultiplier = 0;


        if (bgPieces[1].pos.x < 0) {
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0)
            bgPieces.push(bgPieces.shift())
        }
        bgPieces[0].move(-100, 0)
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0);

         /* Scrolling up when Sonic jumps */
        bgPieces[0].moveTo(bgPieces[0].pos.x, -sonic.pos.y / 10 - 50);
        bgPieces[1].moveTo(bgPieces[1].pos.x, -sonic.pos.y / 10 - 50);
    
        if (platforms[1].pos.x < 0) {
            platforms[0].moveTo(platforms[1].pos.x + platforms[1].width * 4, 450)
            platforms.push(platforms.shift());
        }
        platforms[0].move(-gameSpeed, 0);
        platforms[1].moveTo(platforms[0].pos.x + platforms[1].width * 4, 450);
    });
}