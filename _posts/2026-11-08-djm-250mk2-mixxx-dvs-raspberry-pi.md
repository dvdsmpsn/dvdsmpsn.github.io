---
layout: post
title: Touchscreen DVS with a Pioneer DJM-250MK2 and Mixxx on a Raspberry Pi 5
date: 2026-11-08 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- pioneer dj
- mixxx
- raspberry pi
author: David Simpson

---



I've run a Pioneer DJ DJM-250MK2 mixer with Rekordbox control vinyl for several years, but the idea of running this with a full blown laptop and Rekordbox software that only work either when it's attached to the mixer, or with a subscription is a real PITA. 

But if I could replace the laptop with a touchscreen display, and use [Mixxx](https://mixxx.org/) rather than Rekordbox, that would feel freer than having the shackles of a computer, keyboard, mouse and subscription based software.

Using my Pioneer DJ DJM-250MK2 with timecode vinyl and Mixxx on a Raspberry Pi 5 with a touchscreen could be the answer, however things were not entirely straightforward. Linux recognised the mixer and played audio through it straight away. But Mixxx never saw any timecode signal from the turntables.

This post covers everything needed to get it working, the one non-obvious fix, and how to automate it so it just works when the mixer is plugged in.

**Short version:** The mixer sends only digital silence on its USB inputs until the computer does a proprietary handshake over MIDI and keeps sending a keep-alive message. Pioneer's driver on macOS and Windows does this in the background. On Linux you need a small tool called **[djm-fix](https://hg.frantovo.cz/midi/djm-fix/)**. You also need the mixer on PipeWire's **Pro Audio** profile, not the default surround profile, or Mixxx only reads timecode from deck 1.

**Status:** Working with both decks under vinyl control in Mixxx, as of 2 November 2026. *Updated 7 November 2026:* a touchscreen version of the Deere skin (Step 15), backing up Mixxx's settings (Step 16), and two-finger scrolling on the touchscreen (Step 17).

Note: There was liberal use of Claude AI throughout for debugging all the peculiarities of the hardware, software and Mixxx skin design.

---

## The setup

| What? | Details |
|---|---|
| Mixer | Pioneer DJ DJM-250MK2 (USB ID `2b73:0017`, firmware/bcdDevice 1.06) |
| Computer | Raspberry Pi 5 |
| OS | Raspberry Pi OS (Debian 13 "trixie"), kernel `6.18.50+rpt-rpi-2712` |
| Audio stack | PipeWire 1.4.2, WirePlumber 0.5.8, alsa-utils 1.2.14 |
| DJ software | Mixxx 2.5.6 (Flatpak from Flathub), using its JACK API through PipeWire |
| Timecode | Pioneer Rekordbox DVS Control Vinyl |
| Screen | [Showscren HD-140](https://www.amazon.co.uk/dp/B0H3ZBZW62) 14″ portable touchscreen (HDMI + USB touch), squeekboard on-screen keyboard |

## The symptom

- The mixer appears as a USB sound card (`DJM250MK2`), and playback from the Pi to the mixer channels works.
- The capture channels, which should carry the timecode from the turntables, contain **exact digital zeros**. There isn't even analogue noise, which is the giveaway: a real cabling or gain problem still produces a little hiss.
- The USB link itself is healthy. The capture endpoint streams full-size packets at 48 kHz, but every sample in them is zero.
- The same mixer, turntables, cables and records work fine on Mac or Windows with Pioneer's driver.

Recording straight from ALSA with PipeWire out of the way gives the same result, so this isn't a PipeWire or Mixxx problem:

```bash
arecord -D hw:DJM250MK2 -f S24_3LE -c 8 -r 48000 -d 3 test.wav
```

I spent a long time ruling out PipeWire, routing, power-cycling and cables before finding the real cause. Don't repeat that: if your DJM's capture is pure zeros, go straight to djm-fix.

## Why it happens

František Kučera added DJM-250MK2 support to the Linux kernel in 2020 (playback, recording, and the capture-routing controls). While doing that, he found that the mixer refuses to send its raw PHONO/LINE signal (what DVS needs) until a handshake is done:

1. The computer sends a greeting as a MIDI SysEx message.
2. The mixer replies, and the two exchange seeds and verify each other's hashes (FNV-1a).
3. The mixer acknowledges.
4. The computer must then send a keep-alive message **every 200 ms**. If it stops, the mixer silences PHONO/LINE again within about a second.

The kernel driver doesn't do this; it happens in user space. His tool **djm-fix** does it. It also supports the DJM-V10, and DJM-450 support is in progress. His write-ups:

- <https://blog.frantovo.cz/c/387/Pioneer%20DJ%20DJM-250MK2%20support%20in%20the%20Linux%20kernel>
- <https://blog.frantovo.cz/c/396/Pioneer%20DJ%20DJM-V10%20driver%20for%20Linux>

## Step 1: Check the kernel sees the mixer

Any reasonably recent kernel includes the DJM-250MK2 support; Raspberry Pi OS's 6.18 kernel does. Plug in the mixer and check:

```bash
lsusb | grep 2b73          # Bus 003 Device 006: ID 2b73:0017 Pioneer DJ Corporation DJM-250MK2
cat /proc/asound/cards     # ... [DJM250MK2 ]: USB-Audio - DJM-250MK2
amidi -l                   # IO  hw:2,0,0  DJM-250MK2 MIDI 1   <- djm-fix talks to this port
```

The capture stream has **8 channels at 48 kHz only** (`S24_3LE`):

| USB capture channels | Default source |
|---|---|
| 1–2 | Input 1 → deck 1 |
| 3–4 | Input 2 → deck 2 |
| 5–6 | Input 3 → Rec Out |
| 7–8 | unused |

## Step 2: Build djm-fix

```bash
sudo apt install mercurial make pkg-config g++ libasound2-dev
hg clone https://hg.frantovo.cz/midi/djm-fix/ ~/djm-fix     # mirror: https://hg.globalcode.info/midi/djm-fix/
cd ~/djm-fix
make
```

Note: the Mercurial server refuses archive (tarball) downloads, so you do need `hg clone`.

It's about 1,200 lines of C++. It only opens the mixer's raw MIDI port and exchanges SysEx messages with it, with no network or file access. It's worth a quick read before running it.

## Step 3: Run it and check the handshake

```bash
~/djm-fix/build/djm-fix 'Pioneer DJ.*'
```

A successful run looks like this:

```
INFO:  Going to fix card #2
INFO:  Sent greeting message.
INFO:  Received greeting message.
INFO:  Sent message with seed1.
INFO:  Received message with hash1 = dd1cbc7f and seed2 = 000053dc
INFO:  Verification of hash1 was successful.
INFO:  Sent message with hash2.
INFO:  Received acknowledgment message. Started sending keep-alive messages. LINE/PHONO channels should work now.
```

Leave it running for as long as you want DVS. Ctrl+C stops it, and the inputs go silent again.

**Caveat:** djm-fix opens the mixer's MIDI port exclusively. While it runs, nothing else (including Mixxx) can use the DJM as a MIDI controller.

## Step 4: Set the capture routing, *after* the handshake

The kernel exposes the mixer's USB-send routing as ALSA controls. For DVS, inputs 1 and 2 must be set to **Control Tone PHONO** (or **Control Tone LINE** if your turntables go into line inputs):

```bash
amixer -c DJM250MK2 cset name='Input 1 Capture Switch' 0   # 0 = Control Tone PHONO
amixer -c DJM250MK2 cset name='Input 2 Capture Switch' 0
```

The available values are 0 Control Tone PHONO, 1 Control Tone LINE, 2 Post Fader, 3 Cross Fader A, 4 Cross Fader B, 5 Mic, 6 Aux and 7 Rec Out. You can also set them in `alsamixer -c DJM250MK2` (F4 shows the capture controls).

**Gotcha:** set these **while djm-fix is running**, after the acknowledgment. In my case deck 2 worked as soon as djm-fix connected, but deck 1 stayed at exact zeros. Its routing had been set before any handshake had ever happened. Switching Input 1 to a few other sources and back to Control Tone PHONO while djm-fix was running unlocked it, and it then stayed working across djm-fix restarts.

The autostart script below re-sends the current routing after every handshake. If a deck is still silent, re-sending the *same* value may not be enough, because the driver might skip a write that changes nothing (I haven't confirmed this). Switch to a different source and back instead:

```bash
amixer -c DJM250MK2 cset name='Input 1 Capture Switch' 1   # Control Tone LINE
amixer -c DJM250MK2 cset name='Input 1 Capture Switch' 0   # back to Control Tone PHONO
```

## Step 5: Check the signal

Play timecode vinyl on both decks and record a few seconds:

```bash
arecord -D hw:DJM250MK2 -f S24_3LE -c 8 -r 48000 -d 3 test.wav
```

This short script prints the level and approximate frequency of each channel:

```python
#!/usr/bin/env python3
# usage: python3 djm-levels.py test.wav
import sys, wave, math
w = wave.open(sys.argv[1]); d = w.readframes(w.getnframes())
ch_n, width = w.getnchannels(), w.getsampwidth(); n = len(d) // (ch_n * width)
for ch in range(ch_n):
    v = [int.from_bytes(d[(i*ch_n+ch)*width:(i*ch_n+ch+1)*width], 'little', signed=True) / 2**(8*width-1)
         for i in range(n)]
    rms = math.sqrt(sum(x*x for x in v) / n)
    zc = sum(1 for a, b in zip(v, v[1:]) if (a < 0) != (b < 0)) / 2 / (n / w.getframerate())
    print(f"ch{ch+1}: " + (f"{20*math.log10(rms):6.1f} dBFS  ~{zc:.0f} Hz" if rms else "ZERO (digital silence)"))
```

What I measured:

| | ch1–2 (deck 1) | ch3–4 (deck 2) |
|---|---|---|
| Without djm-fix | ZERO | ZERO |
| djm-fix, records stopped | ZERO (routing not re-sent yet) | about −83 dBFS of noise (input is alive) |
| djm-fix, records playing | ZERO (routing not re-sent yet) | **−20 dBFS, ~1000 Hz** |
| djm-fix plus routing re-sent | **−19 dBFS, ~1000 Hz** | **−20 dBFS, ~1000 Hz** |

The Rekordbox control vinyl carrier is 1 kHz at 33⅓ RPM, so ~1000 Hz at around −20 dBFS on both pairs means it's working.

`arecord -D hw:` only works while PipeWire isn't using the mixer: switch its profile to "Off" first (Step 7), or record through PipeWire instead. **When recording through PipeWire from the Pro Audio profile, give the channel map explicitly.** Without it, `pw-record` asks for a surround layout, and PipeWire silently returns zeros for channels it can't match. In my tests that made deck 2 look dead when it was fine:

```bash
pw-record --target alsa_input.usb-Pioneer_DJ_Corporation_DJM-250MK2-00.pro-input-0 \
  --channels 8 --channel-map AUX0,AUX1,AUX2,AUX3,AUX4,AUX5,AUX6,AUX7 \
  --rate 48000 --format s24 test.wav        # stop with Ctrl+C after a few seconds
```

## Step 6: Start djm-fix automatically

You don't want to start djm-fix by hand before every set, so I run it as a **systemd user service**. It needs no root and no system files. A small watcher script:

- waits for the mixer to appear, then starts djm-fix
- re-sends the current deck 1 and deck 2 routing once the handshake is acknowledged
- restarts djm-fix if the handshake doesn't complete within 15 seconds (the author says it sometimes needs a second try)
- stops it when the mixer is unplugged, and starts it again on replug

`~/.local/bin/djm-fix-autostart` (make it executable with `chmod +x`):

```bash
#!/bin/bash
# Keeps djm-fix running for the Pioneer DJM-250MK2 so its USB PHONO/LINE
# capture (DVS timecode) works. Run by ~/.config/systemd/user/djm-fix.service.

CARD=DJM250MK2
BIN="$HOME/djm-fix/build/djm-fix"
PATTERN='Pioneer DJ Corporation DJM-250MK2.*'
HANDSHAKE_TIMEOUT=15
FLAG="${XDG_RUNTIME_DIR:-/tmp}/djm-fix.acked"

resend_routing() {
	sleep 0.5
	for ctl in 'Input 1 Capture Switch' 'Input 2 Capture Switch'; do
		val=$(amixer -c "$CARD" cget name="$ctl" 2>/dev/null | sed -n 's/.*: values=//p')
		if [ -n "$val" ] && amixer -q -c "$CARD" cset name="$ctl" "$val"; then
			echo "autostart: re-sent '$ctl' = $val"
		else
			echo "autostart: WARNING could not re-send '$ctl'"
		fi
	done
}

reader() {
	while IFS= read -r line; do
		echo "$line"
		case "$line" in
		*"Received acknowledgment"*) touch "$FLAG"; resend_routing ;;
		esac
	done
}

stop_fix() {
	kill -INT "$1" 2>/dev/null
	for _ in 1 2 3; do kill -0 "$1" 2>/dev/null || break; sleep 1; done
	kill -KILL "$1" 2>/dev/null
	wait "$1" 2>/dev/null
}

pid=
trap '[ -n "$pid" ] && stop_fix "$pid"; rm -f "$FLAG"; exit 0' INT TERM

while true; do
	if [ ! -e "/proc/asound/$CARD" ]; then
		echo "autostart: waiting for $CARD..."
		until [ -e "/proc/asound/$CARD" ]; do sleep 2; done
		sleep 2   # let the device finish initialising
	fi

	rm -f "$FLAG"
	echo "autostart: starting djm-fix"
	"$BIN" "$PATTERN" > >(reader) 2>&1 &
	pid=$!
	started=$SECONDS

	while kill -0 "$pid" 2>/dev/null; do
		if [ ! -e "/proc/asound/$CARD" ]; then
			echo "autostart: mixer disconnected, stopping djm-fix"
			break
		fi
		if [ ! -e "$FLAG" ] && (( SECONDS - started > HANDSHAKE_TIMEOUT )); then
			echo "autostart: no handshake after ${HANDSHAKE_TIMEOUT}s, retrying"
			break
		fi
		sleep 1
	done
	stop_fix "$pid"
	pid=
	sleep 2
done
```

`~/.config/systemd/user/djm-fix.service`:

```ini
[Unit]
Description=djm-fix: enable DVS capture on Pioneer DJM-250MK2
Documentation=https://blog.frantovo.cz/c/387/

[Service]
ExecStart=%h/.local/bin/djm-fix-autostart
Restart=always
RestartSec=3
KillSignal=SIGTERM

[Install]
WantedBy=default.target
```

Enable it:

```bash
systemctl --user daemon-reload
systemctl --user enable --now djm-fix.service
journalctl --user-unit djm-fix.service -f     # watch it: look for "acknowledgment" and "re-sent"
```

Other useful commands:

```bash
systemctl --user restart djm-fix          # force a fresh handshake
systemctl --user stop djm-fix             # free the MIDI port (e.g. to use the DJM as a MIDI controller)
systemctl --user disable --now djm-fix    # turn autostart off
```

A user service only runs while you're logged in. That's fine if the Pi logs into the desktop automatically to run Mixxx. To run it from boot without a login, run `sudo loginctl enable-linger $USER`.

## Step 7: PipeWire

**Put the mixer on the Pro Audio profile. This is required, not optional.** Pro Audio exposes all 8 channels as plain numbered ports (AUX0–AUX7), with no surround layout in between.

I first set Mixxx up on PipeWire's default "Analog Surround 7.1" profile, and only deck 1's vinyl control worked. Deck 2 showed no circle at all, even though its timecode was clean when recorded through PipeWire. It also had the correct ~90° left/right phase and was wired to the right ports. Swapping the vinyl inputs moved the problem: whichever Mixxx vinyl input read channels 3–4 got nothing usable. Switching the mixer to Pro Audio and selecting the "DJM-250MK2 Pro" device in Mixxx fixed it immediately, and both decks then showed their circles. I didn't dig into exactly how the surround profile mangles channels 3–4 for Mixxx. Use Pro Audio.

```bash
wpctl status | grep -i djm                  # find the device ID of "DJM-250MK2" (the [alsa] device, e.g. 94)
pw-cli enum-params <ID> EnumProfile | grep -A1 Profile:name   # pro-audio was index 4 for me
wpctl set-profile <ID> 4
```

You can also select "Pro Audio" for the DJM-250MK2 in `pavucontrol` (Configuration tab).

PipeWire's default profile for this mixer is "Analog Surround 7.1", and that's what it comes back with after a reboot or replug unless you pin it (below). If Mixxx suddenly can't find its "DJM-250MK2 Pro" device, or deck 2 loses its circle, check the profile first.

Changing the profile while Mixxx is running removes the device Mixxx is using. Afterwards, go back to Sound Hardware and select the new device again.

**Make Pro Audio permanent.** WirePlumber 0.5 deliberately doesn't remember the Pro Audio profile, so after a reboot the mixer comes back on "Analog Surround 7.1" and deck 2 loses its circle again. (I learned this the hard way.) Pin it with a rule in `~/.config/wireplumber/wireplumber.conf.d/51-djm250mk2-pro-audio.conf`:

```
monitor.alsa.rules = [
  {
    matches = [ { device.name = "~alsa_card.usb-Pioneer_DJ_Corporation_DJM-250MK2*" } ]
    actions = { update-props = { device.profile = "pro-audio" } }
  }
]
```

Then run `systemctl --user restart wireplumber` (with Mixxx closed). Check with `wpctl status`: the mixer's sink and source should be named `...pro-output-0` / `...pro-input-0`.

## Step 8: Mixxx

In **Preferences → Sound Hardware**:

- **Sound API:** JACK Audio Connection Kit. The Flatpak goes through PipeWire's JACK support. ALSA also works but fights PipeWire for the device.
- **Sample rate:** **48000 Hz**, the only rate the mixer supports.
- **Device:** **DJM-250MK2 Pro**, not "DJM-250MK2 Analog Surround 7.1" (see Step 7).
- **Output tab:** Deck 1 → DJM-250MK2 Pro, channels 1–2. Deck 2 → channels 3–4. Set the mixer's channel 1/2 input selectors to USB to hear them.
- **Input tab:** **Vinyl Control 1 → DJM-250MK2 Pro, channels 1–2. Vinyl Control 2 → channels 3–4.** This step is easy to forget: without it Mixxx never listens to the timecode, even when the signal is perfect.
- I use a 5 ms buffer with 4 decks configured. On a Pi 5, raise the buffer if you hear crackles.

In **Preferences → Vinyl Control**:

- **Vinyl type:** "Pioneer RekordBox DVS Control Vinyl, Side A" for both decks
- **Speed:** 33⅓ RPM
- **Lead-in:** 10 s (the default)
- Turn on the signal-quality display; the round scopes should show a clean ring when the records are playing.

Then press **VINYL** on each deck so it lights up. Choose ABS or REL mode, load a track and drop the needle.

In the Deere skin the vinyl-control section, with the per-deck VINYL, mode and cueing buttons, is hidden by default. Turn it on from the **View** menu or the skin settings menu. (It didn't always stay on after a restart for me, so the Deere Touch skin in Step 15 simply always shows it.)

With this setup both decks show a clean circle in Preferences → Vinyl Control and on the decks.

## Step 9: Reduce scratch latency

Out of the box, scratching felt noticeably laggier than in Rekordbox. Two settings made it better.

### Smaller audio buffers

With the JACK API, **Mixxx's own latency setting is ignored**. Its log says "Using JACK server's frames per period", and PipeWire decides the buffer size. PipeWire's default was **1024 samples (21 ms)**. The timecode passes through at least one input buffer and one output buffer, so needle movement probably reached the speakers 40–60 ms later. Check the current value with:

```bash
pw-metadata -n settings 0 | grep clock.quantum     # default quantum
pw-top                                             # QUANT column = what's actually running
```

To make PipeWire use **256 samples (5.3 ms)** only while Mixxx runs, set an environment variable on the Flatpak:

```bash
flatpak override --user --env=PIPEWIRE_QUANTUM=256/48000 org.mixxx.Mixxx
# undo: flatpak override --user --unset-env=PIPEWIRE_QUANTUM org.mixxx.Mixxx
```

Restart Mixxx, and `pw-top` should show `256` for the DJM and PortAudio (Mixxx) nodes. If the Pi keeps up, you can try `128/48000` (2.7 ms), which is closer to Rekordbox's latency.

### Faster pitch estimator

In **Preferences → Vinyl Control**, set each deck's pitch estimator to **"Alpha-Beta filter (fast)"** instead of the default "Kalman filter (accurate)". It follows quick movements like scratches more tightly, but the tempo may be slightly less steady when you're not touching the record.

With both changes, scratching felt a bit more direct.

### Real-time priority (needed for small buffers)

At 256 samples, `pw-top` showed the **ERR** (dropout) count climbing by about two per second. Mixxx itself only used about 0.2 ms of each 5.3 ms buffer, so the Pi wasn't too slow. The problem was that **PipeWire wasn't running with real-time priority**. `ps -eLo rtprio,cls,comm | grep data-loop` showed `TS` (normal scheduling) and `ulimit -r` was `0`. Mixxx's log also warned "Engine thread not scheduled with the real-time policy SCHED_FIFO".

Debian's PipeWire grants real-time priority to the `pipewire` group (`/etc/security/limits.d/25-pw-rlimits.conf`: `@pipewire - rtprio 95`), but the default user isn't in that group. Add yourself, then log out and back in:

```bash
sudo usermod -aG pipewire $USER
```

Afterwards, `ulimit -r` should print `95`, and PipeWire's `data-loop` threads should show `FF` (real-time) instead of `TS`. To check for dropouts, watch the ERR column in `pw-top` while playing: it should stay flat. If it still climbs, go back to 512 samples.

*Status: the group change hadn't been tested yet when I wrote this.*

## Step 10: Turn on vinyl control automatically when Mixxx starts

Mixxx deliberately starts with vinyl control **off** on every deck. The deck code forces the VINYL button off at startup, and shutdown saves "off" to `mixxx.cfg`, so there's no setting for this. Mode (ABS/REL) and cueing *are* remembered.

The workaround is a small controller mapping whose startup script switches VINYL on. A mapping needs a MIDI device to attach to. The mixer's own MIDI port is held by djm-fix, and Mixxx hides the built-in "MIDI Through" port. So I made a tiny virtual MIDI port.

**1. The virtual port:** `~/.local/src/mixxx-startup-port/mixxx-startup-port.c`

```c
#include <alsa/asoundlib.h>
#include <unistd.h>

int main(void) {
	snd_seq_t *seq;
	if (snd_seq_open(&seq, "default", SND_SEQ_OPEN_DUPLEX, 0) < 0) return 1;
	snd_seq_set_client_name(seq, "Mixxx Startup");
	if (snd_seq_create_simple_port(seq, "Mixxx Startup",
			SND_SEQ_PORT_CAP_READ | SND_SEQ_PORT_CAP_SUBS_READ |
			SND_SEQ_PORT_CAP_WRITE | SND_SEQ_PORT_CAP_SUBS_WRITE,
			SND_SEQ_PORT_TYPE_MIDI_GENERIC | SND_SEQ_PORT_TYPE_APPLICATION) < 0)
		return 1;
	for (;;) pause();
}
```

```bash
gcc -O2 -Wall -o ~/.local/bin/mixxx-startup-port ~/.local/src/mixxx-startup-port/mixxx-startup-port.c -lasound
```

`~/.config/systemd/user/mixxx-startup-port.service`:

```ini
[Unit]
Description=Virtual MIDI port "Mixxx Startup" (turns on vinyl control in Mixxx at startup)

[Service]
ExecStart=%h/.local/bin/mixxx-startup-port
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now mixxx-startup-port.service
aconnect -l | grep "Mixxx Startup"      # the port should be listed
```

**2. The mapping:** two files in `~/.var/app/org.mixxx.Mixxx/.mixxx/controllers/` (the Flatpak's user mapping folder).

`Vinyl-Control-Autostart.midi.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<MixxxControllerPreset schemaVersion="1" mixxxVersion="2.5.0+">
    <info>
        <name>Vinyl control autostart</name>
        <description>Turns on vinyl control (VINYL) for decks 1 and 2 when Mixxx starts.</description>
    </info>
    <controller id="VinylControlAutostart">
        <scriptfiles>
            <file filename="Vinyl-Control-Autostart.js" functionprefix="VinylControlAutostart"/>
        </scriptfiles>
        <controls/>
        <outputs/>
    </controller>
</MixxxControllerPreset>
```

`Vinyl-Control-Autostart.js`:

```js
// Turns on vinyl control for decks 1 and 2 when Mixxx starts.
// Mixxx always starts with vinyl control off by design, so this mapping,
// attached to the "Mixxx Startup" virtual MIDI port, switches it back on.
//
// Mixxx runs controller scripts before it has finished starting up (before
// the skin loads and vinyl control is ready), and quietly refuses to turn
// VINYL on until then. So try once a second until each deck reports VINYL on,
// then stop and leave VINYL to the user. Give up after MAX_TRIES.
var VinylControlAutostart = {};

VinylControlAutostart.decks = ["[Channel1]", "[Channel2]"];
VinylControlAutostart.INTERVAL_MS = 1000;
VinylControlAutostart.MAX_TRIES = 30;
VinylControlAutostart.tries = 0;
VinylControlAutostart.timer = 0;
VinylControlAutostart.t0 = Date.now();

VinylControlAutostart.log = function(msg) {
    print("Vinyl control autostart (+" + (Date.now() - VinylControlAutostart.t0) + " ms): " + msg);
};

VinylControlAutostart.attempt = function() {
    var self = VinylControlAutostart;
    self.tries++;
    var pending = self.decks.filter(function(group) {
        return engine.getValue(group, "vinylcontrol_enabled") !== 1;
    });
    if (pending.length === 0) {
        self.log("VINYL is on for " + self.decks.join(", ") + " after " + self.tries + " tries");
        self.stop();
        return;
    }
    if (self.tries > self.MAX_TRIES) {
        self.log("giving up; still off: " + pending.join(", "));
        self.stop();
        return;
    }
    pending.forEach(function(group) {
        engine.setValue(group, "vinylcontrol_enabled", 1);
    });
};

VinylControlAutostart.stop = function() {
    if (VinylControlAutostart.timer) {
        engine.stopTimer(VinylControlAutostart.timer);
        VinylControlAutostart.timer = 0;
    }
};

// Deere Touch: after LOAD DECK 1/2 (or Shift+Left/Right) loads the selected
// track, switch the big library off so the decks come back. Short delay so
// the layout doesn't change while a finger is still on the button.
VinylControlAutostart.closeBigLibraryOnLoad = function(value) {
    if (value !== 1) {
        return;
    }
    engine.beginTimer(150, function() {
        engine.setValue("[Skin]", "show_maximized_library", 0);
    }, true);
};

VinylControlAutostart.init = function(id, debugging) {
    VinylControlAutostart.timer = engine.beginTimer(
        VinylControlAutostart.INTERVAL_MS, VinylControlAutostart.attempt);
    VinylControlAutostart.decks.forEach(function(group) {
        engine.makeConnection(group, "LoadSelectedTrack",
            VinylControlAutostart.closeBigLibraryOnLoad);
    });
};

VinylControlAutostart.shutdown = function() {
    VinylControlAutostart.stop();
};
```

The `closeBigLibraryOnLoad` part is an extra for the touchscreen skin in Step 15. It does nothing harmful in other skins: it only switches the maximised library off after a track is loaded with `LoadSelectedTrack`.

**3. Enable it once:** restart Mixxx, then in **Preferences → Controllers**, select **"Mixxx Startup"**. Choose the mapping **"Vinyl control autostart"** first: **Enabled** stays greyed out until a mapping is loaded. Then tick **Enabled**, click **Apply** and **OK**, and reopen Preferences to check it's still ticked. Mixxx remembers this, so from then on VINYL comes on for decks 1 and 2 a few seconds after every start.

**Why the script retries instead of waiting a fixed time.** My first version waited 2 seconds and then switched VINYL on once. That worked when Mixxx reloaded the script while running, but not on a real start: Mixxx runs controller scripts *before* the skin has loaded and vinyl control is ready, and until then it quietly ignores the request. VINYL stays at 0 and doesn't even register a change. On a fresh start the script now needs about 4 tries (about 4 seconds) before Mixxx accepts it:

```
Loaded skin "Deere"
Vinyl control autostart (+4175 ms): VINYL is on for [Channel1], [Channel2] after 4 tries
```

Once both decks report VINYL on, the script stops, so turning VINYL off later is up to you.

**Debugging a mapping.** When Mixxx is opened normally, it doesn't write log messages to disk as they happen, so `print()` output from a script can be missing from `mixxx.log`. Close Mixxx and start it from a terminal instead:

```
flatpak run org.mixxx.Mixxx --controller-debug --log-level debug --log-flush-level debug
```

With `--controller-debug`, Mixxx also reloads the mapping as soon as you save the `.js` file, which makes testing quick. Remember that this is the reload case, not a fresh start.

*Status: tested from a fresh start on 2 November 2026. VINYL comes on for both decks and stays on when tracks are loaded.*

### Reset the tempo when loading a track

With VINYL on, the record sets the tempo. But Mixxx's default setting for loading a track only resets the **key**, not the tempo. If a deck's tempo slider ends up away from 0, every track you load next starts there. (The -8% I kept seeing had a different cause: see Step 13.) Set **Preferences → Decks → "Reset speed/tempo when loading a track"** to reset **key and tempo**. In `mixxx.cfg` that's `SpeedAutoReset 2` under `[Controls]` (the default, `1`, resets only the key). If you edit the file, do it while Mixxx is closed, because Mixxx overwrites it on exit.

## Step 11: Touchscreen and on-screen keyboard

I use a 14″ portable touchscreen with the Pi so I can drive Mixxx without a mouse and keyboard. It's a generic **HD-140**: it identifies as "XYK Display" over HDMI (1920×1200), and its touch controller is a `wch.cn TouchScreen` (USB ID `27c0:0859`) behind a small built-in USB hub. Getting touch to work was a power problem. Getting the on-screen keyboard to behave in Mixxx took more work.

### Touch: give the screen its own power

The screen has two USB-C sockets: one for power only, and one "full-function" socket that carries picture, touch and power over a single USB-C cable (that's how it works with a Mac). On the Pi, the picture comes over HDMI and touch over a USB-A to USB-C data cable into the full-function socket.

At first nothing appeared: no touch device, and not even a failed connection attempt in the kernel log. I ruled out the cable (a UGREEN data cable that worked on a Mac) and the Pi's ports (swapping them around), and the Pi's 5 A supply was fine. The cause was power. I'd been powering the screen from one of the Pi's USB-A ports, and that isn't enough for the panel *and* its touch controller. **With the screen on its own power supply** (its adapter or a phone charger in the power socket), touch appeared straight away:

```
$ lsusb
Bus 001 Device 007: ID 1a40:0101 Terminus Technology Inc. Hub
Bus 001 Device 008: ID 27c0:0859 Cadwell Laboratories, Inc. TouchScreen
```

The kernel's `hid-multitouch` driver handles it, so there's nothing to install. There's only one display, so labwc maps touches to it without any configuration.

If touch disappears, check `lsusb` for the TouchScreen line, and check the screen's power, before debugging anything in software.

### On-screen keyboard: squeekboard

Raspberry Pi OS ships **squeekboard**. In `raspi-config` (Display Options → On-screen Keyboard) it's set to *Autodetect* by default, but that only looks for a touchscreen **once, at login**. If the screen gets power after the Pi has booted, squeekboard never starts. Set it to always run instead. It still only appears when you're typing:

```
sudo raspi-config nonint do_squeekboard S1    # S1 = always on
```

It also puts a keyboard icon in the taskbar, so you can show or hide the keyboard by hand.

### Making the keyboard behave in Mixxx

In most apps squeekboard pops up when you tap a text box and hides when you leave it. In Mixxx (the Qt 6 Flatpak) it misbehaved in three ways:

1. **It never hides.** Mixxx doesn't tell the keyboard when the search box loses focus, because Qt counts the track table as a text-input widget too (you can type in it to jump to a track).
2. **It appears when it shouldn't**, for example when you tap a deck's track title or artwork.
3. **Once it's been hidden by a script, Mixxx can't bring it back reliably.** Squeekboard ignores Mixxx's next request.

I tried hiding the keyboard based on *where* you touch the screen, but Mixxx's search box moves when the keyboard shrinks the window, and when you change view, so that didn't hold up.

The approach that works is to ask Mixxx **which widget has focus**, through the accessibility interface (AT-SPI), and decide from that. A small helper shows the keyboard when a text box (the search box, or a metadata editor) gets focus, and hides it when focus moves to anything else. It only acts on Mixxx and leaves other apps alone.

**1. Install the accessibility service and its Python bindings:**

```
sudo apt install at-spi2-core gir1.2-atspi-2.0
```

**2. Turn on Qt accessibility for the Mixxx Flatpak**, then restart Mixxx:

```
flatpak override --user --env=QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1 org.mixxx.Mixxx
# undo: flatpak override --user --unset-env=QT_LINUX_ACCESSIBILITY_ALWAYS_ON org.mixxx.Mixxx
```

I measured the cost: Mixxx's D-Bus thread, which carries the accessibility traffic, stays at about 0% CPU, and the helper uses under 1%.

**3. The helper**, `~/.local/bin/osk-autohide` (make it executable with `chmod +x`):

```python
#!/usr/bin/python3 -I
"""Show squeekboard only while a real text box has focus in Mixxx.

Mixxx (Qt) asks for the on-screen keyboard when non-text widgets are tapped
(deck title, artwork, track table), never says when a text box loses focus,
and its requests are ignored once the keyboard has been hidden over D-Bus.
So track which widget has focus via AT-SPI (needs
QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1 for Mixxx): show the keyboard when a text
box gets focus, hide it when focus is anything else. Other apps are left alone.

Set OSK_AUTOHIDE_DEBUG=1 to log focus changes.
"""
import os, time

import gi
gi.require_version("Atspi", "2.0")
gi.require_version("Gio", "2.0")
from gi.repository import Atspi, Gio, GLib

APP = os.environ.get("OSK_AUTOHIDE_APP", "mixxx").lower()
DEBUG = os.environ.get("OSK_AUTOHIDE_DEBUG") == "1"
POLL_MS = 100
GRACE = 0.3   # s: keyboard/focus must be settled this long before hiding

bus = Gio.bus_get_sync(Gio.BusType.SESSION)
state = {"app": None, "editable": True, "desc": "?",
         "focus_t": 0.0, "vis": False, "vis_t": 0.0}


def log(*a):
    if DEBUG:
        print(*a, flush=True)


def osk_call(iface, method, args):
    try:
        return bus.call_sync("sm.puri.OSK0", "/sm/puri/OSK0", iface, method,
                             args, None, 0, 300, None)
    except GLib.Error:
        return None


def osk_visible():
    r = osk_call("org.freedesktop.DBus.Properties", "Get",
                 GLib.Variant("(ss)", ("sm.puri.OSK0", "Visible")))
    return bool(r and r.unpack()[0])


def osk_hide():
    osk_call("sm.puri.OSK0", "SetVisible", GLib.Variant("(b)", (False,)))


def osk_show():
    osk_call("sm.puri.OSK0", "SetVisible", GLib.Variant("(b)", (True,)))


def describe(obj):
    try:
        app = (obj.get_application().get_name() or "").lower()
    except Exception:
        app = ""
    try:
        role = obj.get_role_name()
        st = obj.get_state_set()
        editable = st.contains(Atspi.StateType.EDITABLE)
        readonly = st.contains(Atspi.StateType.READ_ONLY)
        name = obj.get_name() or ""
    except Exception:
        return app, False, "?"
    text_role = role in ("entry", "text", "password text", "editbar",
                         "spin button", "combo box", "terminal", "paragraph")
    return app, (editable and not readonly) or (text_role and not readonly), \
        f"{role!r} {name[:30]!r} editable={editable}"


def on_focus(event):
    if not event.detail1:  # focus lost; wait for the gained event
        return
    app, editable, desc = describe(event.source)
    now = time.monotonic()
    state.update(app=app, editable=editable, desc=desc, focus_t=now)
    log(f"focus: app={app!r} {desc} -> keep={editable}")
    # Mixxx's own keyboard request is unreliable: after squeekboard has been
    # hidden over D-Bus it ignores Mixxx until the text input is reset, which
    # Mixxx never does. So show it ourselves whenever a text box gets focus.
    if editable and APP in app and not osk_visible():
        log("show (text box got focus)")
        osk_show()


def check():
    now = time.monotonic()
    vis = osk_visible()
    if vis and not state["vis"]:
        state["vis_t"] = now
    state["vis"] = vis
    if (vis and state["app"] and APP in state["app"] and not state["editable"]
            and now - state["focus_t"] >= GRACE and now - state["vis_t"] >= GRACE):
        log(f"hide (focus is {state['desc']})")
        osk_hide()
        state["vis"] = False
    return True


listener = Atspi.EventListener.new(on_focus)
listener.register("object:state-changed:focused")
GLib.timeout_add(POLL_MS, check)  # Mixxx re-requests the keyboard after focus
print(f"osk-autohide: watching focus in {APP!r}", flush=True)
GLib.MainLoop().run()
```

Two details in it come from testing:

- **Mixxx asks for the keyboard slightly *before* it reports the new focus.** If the helper acted instantly, it would hide the keyboard you'd just asked for. So it only hides once the keyboard has been up, and focus has been off a text box, for 0.3 s. That's why it takes a moment to go away after you tap a track.
- **The helper opens the keyboard itself** when a text box gets focus, instead of relying on Mixxx's request (problem 3 above).

To watch what it decides, run it in a terminal with `OSK_AUTOHIDE_DEBUG=1 ~/.local/bin/osk-autohide`. The Mixxx search box shows up as an editable `'combo box'`.

**4. Start it at login** with a systemd user service, `~/.config/systemd/user/osk-autohide.service`:

```ini
[Unit]
Description=Show/hide squeekboard by Mixxx text focus

[Service]
ExecStart=%h/.local/bin/osk-autohide
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

Use `default.target`, not `graphical-session.target`. labwc on Raspberry Pi OS never activates `graphical-session.target`, so a service tied to it never starts. The helper only needs the session D-Bus, so it's fine for it to start before the desktop.

```
systemctl --user daemon-reload
systemctl --user enable --now osk-autohide.service
```

**Known limit:** if you close the keyboard with its own hide key while the search box still has focus, tapping the search box again won't reopen it, because focus hasn't changed. Tap a track first, then the search box, or use the taskbar keyboard icon.

### Make Mixxx bigger for touch

At 1920×1200 on a 14″ screen, Mixxx's buttons are too small for fat fingers. Rather than scaling the whole desktop, I set Mixxx's own **Preferences → Interface → Scale factor** to **150%** (`ScaleFactor 1.5` in `mixxx.cfg`). The display stays at 100%, so the rest of the desktop is unchanged.

### Open Mixxx maximised, not full screen

Mixxx has its own **Preferences → Interface → Start in full-screen mode**, but don't use it with the on-screen keyboard. In full screen, labwc draws Mixxx **above** squeekboard, so the keyboard opens behind Mixxx where you can't see it. Maximised fills the screen except for the taskbar, and the keyboard still appears on top.

labwc can maximise Mixxx when it opens, using a window rule. Raspberry Pi OS starts labwc with `-m`, which merges your `~/.config/labwc/rc.xml` with the system one, so the file only needs the rule:

```xml
<?xml version="1.0"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <windowRules>
    <!-- Mixxx main window maximised. type="normal" leaves dialogs (Preferences) alone. -->
    <windowRule identifier="*mixxx*" type="normal">
      <action name="Maximize" />
    </windowRule>
  </windowRules>
</openbox_config>
```

Then reload labwc with `labwc --reconfigure`. Matching is case-insensitive and supports wildcards. Because Mixxx runs under XWayland (Step 12), `identifier` is its X11 `WM_CLASS` (the desktop file says `StartupWMClass=org.mixxx.mixxx`). `type="normal"` matters: without it, the Preferences window, which the Step 13 helper opens at every start, would be maximised too.

## Step 12: Make Mixxx draw on the GPU

After all this, Mixxx was using about 130% CPU. Per-thread `top` showed where it went: four `llvmpipe` threads. That's Mesa's **software** renderer, so the waveforms were being drawn on the CPU. Mixxx's log confirmed it:

```
OpenGL driver version string "4.6 (Compatibility Profile) Mesa 26.2.4", vendor "Mesa", renderer "llvmpipe (LLVM 21.1.8, 128 bits)"
```

### Why

It wasn't missing drivers or permissions. The Flatpak runtime's Mesa includes the Pi 5 GPU driver (`v3d_dri.so`), and the sandbox can open `/dev/dri/renderD128`. I wrote a small EGL probe in Python with `ctypes`, run with the Flatpak runtime's Python, and asked Mesa which renderer it picks:

| Where | Wayland | X11 (XWayland) | Surfaceless |
|---|---|---|---|
| Host (Raspberry Pi's Mesa 26.2.2) | V3D 7.1 | V3D 7.1 | n/a |
| Flatpak (Flathub Mesa 26.2.4) | **llvmpipe** | **V3D 7.1** | V3D 7.1 |

On a Pi 5, the display controller (`vc4`, `/dev/dri/card1`) and the GPU (`v3d`, `card0`/`renderD128`) are separate devices. labwc tells Wayland clients to use `card1`, which is display-only and has no render node. Raspberry Pi's patched Mesa on the host knows to switch to V3D. The stock Flathub Mesa doesn't, so Mesa ends up with no device and falls back to software:

```
MESA-EGL: warning: failed to get driver name for fd -1
MESA-EGL: warning: MESA-LOADER: failed to retrieve device information
```

`DRI_PRIME` and `MESA_LOADER_DRIVER_OVERRIDE` don't help. Under X11, XWayland passes clients the right GPU device (via DRI3), so the Flatpak's own Mesa gets V3D.

### Fix: run Mixxx through XWayland

```
flatpak override --user --socket=x11 --nosocket=wayland --env=QT_QPA_PLATFORM=xcb org.mixxx.Mixxx
# undo: flatpak override --user --socket=wayland --nosocket=x11 --unset-env=QT_QPA_PLATFORM org.mixxx.Mixxx
```

`--nosocket=wayland` is needed. With only `--socket=x11`, Flatpak still doesn't give the app an X display (`DISPLAY` is empty) as long as Wayland is available. Restart Mixxx afterwards. The log should now say:

```
OpenGL driver version string "3.1 Mesa 26.2.4", vendor "Broadcom", renderer "V3D 7.1.10.2"
```

Mixxx's CPU use dropped from about 130% to about 11%. That was measured idle, with nothing playing, so it's not a strict like-for-like comparison, but the software renderer threads are gone.

Touch and the on-screen keyboard helper (Step 11) don't depend on Wayland. The helper uses AT-SPI, which works the same for X11 apps.

## Step 13: Fix the -8% tempo (Mixxx 2.5.6 sample-rate bug)

With VINYL on and both records playing at 33⅓ with the pitch sliders at 0, both decks in Mixxx showed about **-8%**.

### The records were fine

Measuring the timecode carrier once a second (zero crossings per second on USB channels 1 and 3) showed **1000 Hz ±1 on both decks**, which is exactly 33⅓ RPM. At the same moment, a diagnostic line in the vinyl startup mapping (`print(engine.getValue("[Channel1]", "bpm"))` and `file_bpm`) showed what Mixxx was reading:

| Deck | Mixxx BPM | Track BPM | Ratio |
|---|---|---|---|
| 1 | 114.8 | 125 | 0.918 |
| 2 | 111.1 | 121 | 0.918 |

0.918 is 44100 ÷ 48000. Mixxx's timecode decoder assumed **44.1 kHz** audio while the DJM-250MK2 only does **48 kHz** (`Rates: 48000` in `/proc/asound/DJM250MK2/stream0`).

### Why

In Mixxx 2.5.6, `VinylControlXwax` reads the sample rate from `[App],samplerate` once, when it's created. On startup the decoders are created **before** the audio device has set that value, so they get the default, 44100. Every start logs it:

```
[Main] Xwax Vinyl control starting with a sample rate of: 44100
```

Pressing **OK** (or Apply) in Preferences re-applies the Vinyl Control page, which always rebuilds the decoders, this time with the real rate:

```
[VinylControlProcessor 1] Xwax Vinyl control starting with a sample rate of: 48000
```

That's why the -8 seemed to come and go: it was fine after any visit to Preferences and came back after every restart. Mixxx's 2.5 branch fixed this on 8 October 2026 ([commit 432ec4bece, "Fix vinyl control startup sample rate"](https://github.com/mixxxdj/mixxx/commit/432ec4bece)), after the 2.5.6 release. Until a release includes it, you need a workaround.

### Workaround: press OK in Preferences after every start

By hand: open **Preferences** and click **OK** once after Mixxx starts, without changing anything.

To do it automatically, I use a small helper that waits for Mixxx to start, gives it 8 seconds to settle (VINYL autostart takes about 4), then presses **Options → Preferences** and **OK** through the accessibility interface. It uses the same AT-SPI setup as the keyboard helper in Step 11, so it needs `at-spi2-core`, `gir1.2-atspi-2.0` and `QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1` for Mixxx. The Preferences window flashes up for about a second.

`~/.local/bin/mixxx-vinyl-samplerate-fix` (make it executable with `chmod +x`):

```python
#!/usr/bin/python3 -I
"""Work around Mixxx 2.5.6 starting vinyl control at the wrong sample rate.

Mixxx 2.5.6 builds its timecode decoders (VinylControlXwax) before the audio
device has set [App],samplerate, so they assume 44100 Hz. The DJM-250MK2 runs
at 48000 Hz, so every record reads 44100/48000 = 0.919, i.e. about -8%.
Pressing OK in Preferences re-applies the Vinyl Control page, which rebuilds
the decoders with the real rate. This does that automatically, through AT-SPI
(needs QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1 for Mixxx), each time Mixxx starts.

Fixed upstream in Mixxx's 2.5 branch on 2026-10-08 (commit 432ec4bece,
"Fix vinyl control startup sample rate"); remove this once a release has it.
"""
import subprocess, time, warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)

import gi
gi.require_version("Atspi", "2.0")
from gi.repository import Atspi

SETTLE_S = 8      # after the window appears: let startup and VINYL autostart finish
POLL_S = 2


def log(msg):
    print(msg, flush=True)


def mixxx_pid():
    r = subprocess.run(["pgrep", "-x", "mixxx.bin"], capture_output=True, text=True)
    pids = r.stdout.split()
    return pids[0] if pids else None


def mixxx_app():
    desk = Atspi.get_desktop(0)
    for i in range(desk.get_child_count()):
        app = desk.get_child_at_index(i)
        try:
            if app and (app.get_name() or "").lower() == "mixxx":
                return app
        except Exception:
            pass
    return None


def find(obj, pred, depth=0, max_depth=12):
    if obj is None or depth > max_depth:
        return None
    try:
        if pred(obj):
            return obj
        n = obj.get_child_count()
    except Exception:
        return None
    for i in range(n):
        hit = find(obj.get_child_at_index(i), pred, depth + 1, max_depth)
        if hit:
            return hit
    return None


def is_(roles, name):
    def pred(o):
        return o.get_role_name() in roles and (o.get_name() or "").replace("&", "") == name
    return pred


BUTTON = ("button", "push button")  # Qt 6 reports "button"


def find_shallow(obj, pred, max_depth=6):
    """Breadth-first: the dialog's OK button is near the top of a huge tree."""
    level = [obj]
    for _ in range(max_depth + 1):
        nxt = []
        for o in level:
            try:
                if pred(o):
                    return o
                nxt.extend(o.get_child_at_index(i) for i in range(o.get_child_count()))
            except Exception:
                pass
        level = [o for o in nxt if o is not None]
    return None


def press(obj):
    ai = obj.get_action_iface()
    if not ai:
        return False
    for i in range(ai.get_n_actions()):
        if ai.get_action_name(i) in ("Press", "press", "click"):
            return ai.do_action(i)
    return ai.do_action(0) if ai.get_n_actions() else False


def has_main_window(app):
    try:
        for i in range(app.get_child_count()):
            w = app.get_child_at_index(i)
            if w and w.get_role_name() == "frame":
                return True
    except Exception:
        pass
    return False


def prefs_dialog(app):
    try:
        for i in range(app.get_child_count()):
            w = app.get_child_at_index(i)
            if w and w.get_role_name() == "dialog" and "Preferences" in (w.get_name() or ""):
                return w
    except Exception:
        pass
    return None


def apply_fix():
    app = mixxx_app()
    if not app:
        log("Mixxx not on the accessibility bus (is QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1 set?)")
        return False
    dlg = prefs_dialog(app)
    if dlg:
        # Someone (or an earlier attempt) has it open: pressing OK still applies.
        return press_ok(dlg)
    item = find(app, is_(("menu item",), "Preferences"))
    if not item or not press(item):
        log("could not find/press Options > Preferences")
        return False
    for _ in range(50):  # up to 5 s for the dialog
        time.sleep(0.1)
        dlg = prefs_dialog(app)
        if dlg:
            break
    else:
        log("Preferences dialog did not appear")
        return False
    time.sleep(0.5)
    return press_ok(dlg)


def press_ok(dlg):
    ok = find_shallow(dlg, is_(BUTTON, "OK"))
    if not ok or not press(ok):
        log("could not find/press OK in Preferences")
        return False
    log("pressed Preferences > OK: vinyl decoders rebuilt at the real sample rate")
    return True


done_for = None
log("mixxx-vinyl-samplerate-fix: waiting for Mixxx")
while True:
    pid = mixxx_pid()
    if pid and pid != done_for:
        app = mixxx_app()
        if app and has_main_window(app):
            log(f"Mixxx started (pid {pid}); waiting {SETTLE_S} s for startup to settle")
            time.sleep(SETTLE_S)
            if mixxx_pid() == pid:
                for attempt in range(3):
                    if apply_fix():
                        break
                    time.sleep(3)
                done_for = pid
    time.sleep(POLL_S)
```

Two things I tripped over: in Qt 6 the dialog's buttons have the AT-SPI role `button`, not `push button`. And a depth-first search for "OK" crawls through every page of the Preferences dialog, so the helper searches breadth-first: OK is near the top.

`~/.config/systemd/user/mixxx-vinyl-samplerate-fix.service`:

```ini
[Unit]
Description=Mixxx 2.5.6 workaround: rebuild vinyl decoders at the real sample rate after startup
Documentation=https://github.com/mixxxdj/mixxx/commit/432ec4bece

[Service]
ExecStart=%h/.local/bin/mixxx-vinyl-samplerate-fix
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

```
systemctl --user daemon-reload
systemctl --user enable --now mixxx-vinyl-samplerate-fix
```

After the Preferences window has flashed, both decks read 0% with the records at 33⅓, and Mixxx's BPM matches the tracks' BPM. **Once a Mixxx release includes the upstream fix**, disable and delete the helper: `systemctl --user disable --now mixxx-vinyl-samplerate-fix`.

## Step 14: Start Mixxx automatically after a reboot

The Pi logs in automatically (Raspberry Pi OS's default `autologin-user=pi` in `/etc/lightdm/lightdm.conf`), and everything else starts at login. Mixxx itself needs an autostart entry, with one catch: **if Mixxx starts before the mixer is ready, it can't find "DJM-250MK2 Pro" and opens without sound**, and you have to restart it. So the launcher waits until the djm-fix handshake has been acknowledged (the autostart script in Step 6 creates `$XDG_RUNTIME_DIR/djm-fix.acked`), and PipeWire has the mixer's Pro Audio input. If the mixer isn't on within 5 minutes, it starts Mixxx anyway.

`~/.local/bin/mixxx-autostart` (make it executable with `chmod +x`):

```bash
#!/bin/bash
# Start Mixxx after login, but only once the DJM-250MK2 is ready, so Mixxx
# finds "DJM-250MK2 Pro" instead of opening without sound.
#
# Ready means: djm-fix has had its handshake acknowledged (it creates
# $FLAG, see ~/.local/bin/djm-fix-autostart) and PipeWire has the mixer's
# Pro Audio input. If the mixer isn't on within MAX_WAIT seconds, start
# Mixxx anyway, so the Pi is still usable without it.
# Run from ~/.config/autostart/mixxx-autostart.desktop.

FLAG="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/djm-fix.acked"
NODE="alsa_input.usb-Pioneer_DJ_Corporation_DJM-250MK2-00.pro-input-0"
MAX_WAIT=300

log() { echo "mixxx-autostart: $*"; logger -t mixxx-autostart -- "$*"; }

if pgrep -x mixxx.bin >/dev/null; then
	log "Mixxx is already running"
	exit 0
fi

waited=0
until [ -e "$FLAG" ] && pw-cli ls Node 2>/dev/null | grep -q "$NODE"; do
	if (( waited >= MAX_WAIT )); then
		log "mixer not ready after ${MAX_WAIT}s; starting Mixxx anyway"
		break
	fi
	(( waited == 0 )) && log "waiting for the DJM-250MK2 (djm-fix handshake and Pro Audio input)"
	sleep 2
	(( waited += 2 ))
done

# Give djm-fix a moment to re-send the capture routing after the handshake.
sleep 3
log "starting Mixxx (waited ${waited}s for the mixer)"
exec /usr/bin/flatpak run --branch=stable --arch=aarch64 --command=mixxx org.mixxx.Mixxx
```

`~/.config/autostart/mixxx-autostart.desktop`, which the desktop session runs at login:

```ini
[Desktop Entry]
Type=Application
Name=Mixxx (wait for DJM-250MK2)
Comment=Start Mixxx after login once the DJM-250MK2 is ready
Exec=/home/pi/.local/bin/mixxx-autostart
Terminal=false
NoDisplay=true
```

It logs to the journal (`journalctl --user -t mixxx-autostart`, or `journalctl -t mixxx-autostart`) with how long it waited for the mixer. If Mixxx is already running, it does nothing.

So after a reboot, with the mixer switched on: the Pi logs in, djm-fix does the handshake, Mixxx opens maximised (Step 11) with the Deere Touch skin and the mixer and effects hidden (Step 15), VINYL comes on for both decks (Step 10), and the Preferences window flashes once to fix the -8% (Step 13).

## Step 15: A touchscreen-friendly skin ("Deere Touch")

With fingers instead of a mouse, two things in Deere were awkward: loading a track (double-tap or drag a tiny row onto a deck) and the big-library toggle, a 20-pixel arrow next to the search box. I wanted a "load to deck 1" and "load to deck 2" button on every row of the library, but that isn't possible: the track list is part of Mixxx's C++ code, and a skin can only change what's around it. The next best thing is a bar of big buttons right above the list:

**◀ LOAD DECK 1 | LIBRARY ⛶ | LOAD DECK 2 ▶**

Tap a track, then tap a LOAD button. It's two taps instead of one, but both targets are large.

The skin is a copy of Deere called **Deere Touch**. Download: **[DeereTouch-mixxx-skin.zip](/assets/DeereTouch-mixxx-skin.zip)** (includes a README). Changes from Deere:

- **Load bar** above the track list. The LOAD buttons use `[Channel1],LoadSelectedTrack` / `[Channel2],LoadSelectedTrack` (the same controls as the Shift+Left/Right keyboard shortcuts). LIBRARY, with a maximise/minimise icon next to it, toggles the big (maximised) library via `[Skin],show_maximized_library`. Both halves turn green while it's on, and the icon switches from "maximise" to "minimise".
- **Search box and sidebar only in the big library.** In the normal view the track list uses the full width under the decks. To search, open the big library with LIBRARY.
- **Loading a track closes the big library**, so you're straight back at the decks. This part is in the controller script from Step 10 (`closeBigLibraryOnLoad`), because a skin button can only drive one control cleanly. It waits 150 ms so the layout doesn't change under your finger.
- **The vinyl control section is always visible.** In Deere it's tied to a saved setting that kept coming back as "off" after restarts.
- **Bigger buttons on decks 1 and 2** (×1.5): CUE/play, hot cues, loop and beatjump, eject/repeat/key, FX1/FX2, SYNC and tempo +/−, and the vinyl section. The rest of the skin (toolbar, effects, samplers) keeps Deere's sizes.
- **MIXER and EFFECTS are hidden at every start.** I mix on the DJM, so Mixxx's on-screen mixer and effects mostly take up space. Tap either button to show it during a set. Hiding them doesn't change any volume, EQ or crossfader settings.

### Install

```
mkdir -p ~/.var/app/org.mixxx.Mixxx/.mixxx/skins
unzip ~/Documents/DeereTouch-mixxx-skin.zip -d /tmp/deere-touch
cp -r /tmp/deere-touch/DeereTouch ~/.var/app/org.mixxx.Mixxx/.mixxx/skins/
```

Then choose **Deere Touch** in **Preferences → Interface → Skin** (or, with Mixxx closed, set `ResizableSkin DeereTouch` under `[Config]` in `mixxx.cfg`). For the "close the big library after loading" part, use the Step 10 script as listed above.

### How it's built

The load bar wraps Deere's `<Library>` widget in `library.xml`:

```xml
<WidgetGroup>
  <Layout>vertical</Layout>
  <SizePolicy>me,me</SizePolicy>
  <Children>
    <WidgetGroup>
      <ObjectName>TouchLoadBar</ObjectName>
      <Layout>horizontal</Layout>
      <SizePolicy>me,f</SizePolicy>
      <Children>
        <PushButton>
          <ObjectName>TouchLoad1</ObjectName>
          <SizePolicy>me,f</SizePolicy>
          <MinimumSize>60,34</MinimumSize>
          <NumberStates>1</NumberStates>
          <State><Number>0</Number><Text>◀  LOAD DECK 1</Text></State>
          <Connection>
            <ConfigKey>[Channel1],LoadSelectedTrack</ConfigKey>
            <EmitOnPressAndRelease>true</EmitOnPressAndRelease>
            <ButtonState>LeftButton</ButtonState>
          </Connection>
        </PushButton>
        <!-- TouchLibGroup: LIBRARY text button + icon button, both 2-state on [Skin],show_maximized_library -->
        <!-- TouchLoad2: same as TouchLoad1 with [Channel2] -->
      </Children>
    </WidgetGroup>
    <Library>
      <ShowButtonText>false</ShowButtonText>
      <TrackTableBackgroundColorOpacity>0.175</TrackTableBackgroundColorOpacity>
    </Library>
  </Children>
</WidgetGroup>
```

The left column (search, sidebar, cover art) gets a `<Connection>` to `[Skin],show_maximized_library` bound to `visible`. In `vinylcontrol.xml` the `<Connection>` to `[Skin],show_vinylcontrol` is removed. In `skin.xml` the `show_mixer` and `show_effectrack` attributes are changed from `persist="true"` with `1` to `persist="false"` with `0`. The button styles are at the end of `style.qss`.

**Bigger deck buttons.** Deere sizes most buttons through shared variables in `skin.xml` (`SquareButtonMinimumSize` 22,22 and so on) that the toolbar, effects and samplers use too. To enlarge only the decks, `skin.xml` gets scaled copies (`DeckSquareButtonMinimumSize` 33,33, `DeckSmallSquareButton…`, `DeckHorizontalStretchButton…`, `DeckFXAssignmentButton…`), the deck files (`deck*.xml`, `hotcue*.xml`, `special_cue*.xml`, `vinylcontrol.xml`) refer to those instead, and their own fixed `<Size>`/`<MinimumSize>`/`<MaximumSize>` values are multiplied by 1.5. The deck FX1/FX2 buttons use a copy of `fx_unit_group_assignment_button.xml` (`…_deck.xml`), because the original is shared with the mic and aux sections. The button row next to the overview waveform was limited to 46 px high, which had to grow to 69 to fit two rows of bigger buttons.

**Text and icon on one button.** A Mixxx skin `PushButton` can show text *or* images, not both, and its `<Pressed>`/`<Unpressed>` images are drawn from the top-left corner at their own size, not centred. So LIBRARY is two buttons on the same control, styled as one split button, and the icon comes from the stylesheet, where Qt centres it:

```css
#TouchBigLibIcon { image: url(skin:/icon/touch_maximize.svg) no-repeat center center; padding: 6px; }
#TouchBigLibIcon[value="1"] { image: url(skin:/icon/touch_minimize.svg) no-repeat center center; }
```

Qt scales a stylesheet `image` to fill the button, so the SVG's own size makes no difference; the `padding` is what sets the icon size. The two icons are Material Design's "fullscreen" and "fullscreen exit" shapes (Apache 2.0).

**Pitfall when copying a built-in skin.** Deere refers to its own files as `skins:Deere/library.xml`, and its stylesheet uses `skin:/../Deere/icon/...`. `skins:` only searches Mixxx's built-in skins folder, so in a copy under `~/.mixxx/skins/` this silently loads the *original* Deere files (my changes didn't show up), and after renaming the paths to `skins:DeereTouch/` the window was completely blank, with "Could not open template file" in `mixxx.log`. Use paths relative to the skin itself instead:

```
cd ~/.var/app/org.mixxx.Mixxx/.mixxx/skins/DeereTouch
grep -rl 'skins:Deere/' . | xargs sed -i 's#skins:Deere/#skin:#g'
sed -i 's#skin:/\.\./Deere/#skin:/#g; s#skin:\.\./Deere/#skin:#g' style.qss skin_settings.xml
```

Mixxx only reads the skin when it starts or when you change skins, so restart Mixxx after editing it.

*Status: tested on 7 November 2026 with the Mixxx 2.5.6 Flatpak at 150% scale: the load buttons load the selected track, loading closes the big library, and VINYL still comes on at startup.*

## Step 16: Back up Mixxx's settings

On 7 November, after a restart, Mixxx came up with **all its preferences back to defaults**: wrong skin, scale factor 100%, Serato instead of Rekordbox timecode, the Kalman pitch estimator, the startup mapping disabled. Only `mixxx.cfg` was affected. The sound hardware setup (`soundconfig.xml`), the library and the Flatpak overrides were fine. I didn't find a definite cause. Mixxx writes `mixxx.cfg` when it closes, and several empty log files suggest it had been killed without closing properly (for example by switching the Pi off), which can leave a broken settings file that Mixxx replaces with defaults.

Once everything is set up, keep a copy (with Mixxx closed, so the file is complete):

```
cd ~/.var/app/org.mixxx.Mixxx/.mixxx
cp mixxx.cfg mixxx.cfg.good
```

To restore: close Mixxx, `cp mixxx.cfg.good mixxx.cfg`, start Mixxx. If you don't have a copy, these are the settings from this post to redo:

| Where | Setting | `mixxx.cfg` |
|---|---|---|
| Interface | Skin Deere Touch (Step 15), scale factor 150% | `[Config]` `ResizableSkin DeereTouch`, `ScaleFactor 1.5` |
| Vinyl Control | Pioneer RekordBox DVS Control Vinyl, Side A; 33⅓; lead-in 10 s; Alpha-Beta filter (fast) | `[Channel1]`/`[Channel2]` `vinylcontrol_*` |
| Vinyl Control | Signal quality display on | `[VinylControl]` `show_signal_quality 1` |
| Decks | Reset key and tempo on track load | `[Controls]` `SpeedAutoReset 2` |
| Controllers | "Mixxx Startup" enabled with "Vinyl control autostart" (Step 10) | `[Controller]` `Mixxx_Startup 1`, `[ControllerPreset]` |

A shutdown from the desktop menu closes Mixxx properly. Pulling the power doesn't.

## Step 17: Two-finger scrolling on the touchscreen

With one finger you can tap and drag in Mixxx, but you can't scroll the track list the way you would on a phone. Dragging one finger in the list selects tracks, or starts dragging a track somewhere. I wanted a **two-finger drag** to scroll.

### Why it doesn't work out of the box

My `~/.config/labwc/rc.xml` has a touch entry with `mouseEmulation="yes"`:

```xml
<touch deviceName="wch.cn TouchScreen (USB 1-1.1)" mapToOutput="HDMI-A-1" mouseEmulation="yes"/>
```

With mouse emulation, labwc turns **every** finger into the same mouse pointer: a press, motion and a release. Mixxx never learns there were two fingers. labwc's manual says so directly: neither libinput nor labwc interprets touchscreen gestures. Turning mouse emulation off wouldn't help either, because Qt widgets don't scroll on a two-finger touchscreen drag on their own.

### Fix: a small gesture helper

`touch-scroll` sits between the touchscreen and labwc:

1. It reads the touchscreen directly (`/dev/input/event*`; the default user is already in the `input` group on Raspberry Pi OS) and **grabs** it, so labwc stops seeing the raw touches.
2. It creates a **virtual mouse** in labwc through the wlroots virtual-pointer protocol (`zwlr_virtual_pointer_manager_v1`, which labwc supports). It speaks the Wayland protocol directly in plain Python, so there's nothing to install, and it needs neither `sudo` nor `/dev/uinput`.
3. **One finger** works exactly like labwc's mouse emulation: move the pointer there, press, follow, release. Buttons, sliders, jog wheels and the on-screen keyboard behave as before.
4. **Two fingers**: it releases the press and turns the up/down movement of the fingers into **mouse-wheel clicks** where the first finger went down. Scrolling is "natural" (the list follows your fingers), with one wheel click per 40 screen pixels of movement.

It keeps scrolling if you lift one finger mid-gesture, and only goes back to normal once all fingers are off the glass. If the touchscreen drops off USB (see "Touch: give the screen its own power" in Step 11), it waits for it to come back. If the helper stops for any reason, the kernel releases the grab and labwc's own touch handling takes over again immediately, so a crash can't leave you without touch.

One side effect: when you put the second finger down, the first finger has already pressed. So whatever is under it gets a single click before the scroll starts. In the track list that just selects a row.

**1. The helper**, `~/.local/bin/touch-scroll` (make it executable with `chmod +x`):

```python
#!/usr/bin/python3 -I
"""touch-scroll: two-finger drag on the touchscreen = mouse-wheel scrolling.

labwc's touch mouseEmulation turns every finger into the same mouse, so apps
never see two fingers. This helper takes over the touchscreen (EVIOCGRAB),
does the same one-finger -> mouse emulation itself through the wlroots
virtual-pointer protocol, and turns two-finger vertical drags into wheel
clicks at the spot where the first finger went down.

If this program stops, the grab is released and labwc's own touch handling
comes straight back.

Tuning (environment variables):
  TOUCH_SCROLL_STEP    finger pixels per wheel click (default 40)
  TOUCH_SCROLL_NATURAL 1 = content follows fingers like a phone (default 1)
  TOUCH_SCROLL_DEBUG   1 = log gestures
"""
import errno, fcntl, os, select, socket, struct, sys, time

STEP = float(os.environ.get("TOUCH_SCROLL_STEP", "40"))
NATURAL = os.environ.get("TOUCH_SCROLL_NATURAL", "1") == "1"
DEBUG = os.environ.get("TOUCH_SCROLL_DEBUG") == "1"

EV_SYN, EV_KEY, EV_ABS = 0, 1, 3
SYN_REPORT = 0
ABS_MT_SLOT, ABS_MT_POSITION_X, ABS_MT_POSITION_Y, ABS_MT_TRACKING_ID = 0x2F, 0x35, 0x36, 0x39
BTN_LEFT = 0x110
EVIOCGRAB = 0x40044590
EVIOCGABS = lambda a: 0x80184540 + a
EVENT = struct.Struct("llHHi")


def log(*a):
    print(*a, flush=True)


def dbg(*a):
    if DEBUG:
        log(*a)


# ---------------------------------------------------------------- touchscreen
def find_touchscreen():
    for name in sorted(os.listdir("/sys/class/input")):
        if not name.startswith("event"):
            continue
        d = f"/sys/class/input/{name}/device"
        try:
            props = int(open(f"{d}/properties").read().split()[-1], 16)
            abs_caps = int(open(f"{d}/capabilities/abs").read().split()[-1], 16)
        except OSError:
            continue
        # INPUT_PROP_DIRECT + multitouch slots = a real touchscreen
        if props & 0x2 and abs_caps & (1 << ABS_MT_SLOT):
            return "/dev/input/" + name, open(f"{d}/name").read().strip()
    return None, None


def absinfo(fd, code):
    buf = fcntl.ioctl(fd, EVIOCGABS(code), b"\0" * 24)
    _val, lo, hi = struct.unpack("6i", buf)[:3]
    return lo, hi


# ---------------------------------------------------------------- wayland
class VirtualPointer:
    def __init__(self):
        path = os.path.join(os.environ["XDG_RUNTIME_DIR"], os.environ.get("WAYLAND_DISPLAY", "wayland-0"))
        self.s = socket.socket(socket.AF_UNIX)
        self.s.connect(path)
        self.next_id = 2
        reg = self._new()
        self._send(1, 1, struct.pack("<I", reg))  # wl_display.get_registry
        cb = self._new()
        self._send(1, 0, struct.pack("<I", cb))  # wl_display.sync
        globs, buf, done = {}, b"", False
        while not done:
            data = self.s.recv(65536)
            if not data:
                raise ConnectionError("compositor closed the connection")
            buf += data
            while len(buf) >= 8:
                obj, op, size = struct.unpack("<IHH", buf[:8])
                if len(buf) < size:
                    break
                msg, buf = buf[8:size], buf[size:]
                if obj == reg and op == 0:
                    gname, ln = struct.unpack("<II", msg[:8])
                    iface = msg[8:8 + ln - 1].decode()
                    ver = struct.unpack("<I", msg[8 + (ln + 3) // 4 * 4:][:4])[0]
                    globs[iface] = (gname, ver)
                elif obj == cb:
                    done = True
        if "zwlr_virtual_pointer_manager_v1" not in globs:
            raise RuntimeError("compositor has no zwlr_virtual_pointer_manager_v1")
        seat = self._bind(reg, globs, "wl_seat", 1)
        mgr = self._bind(reg, globs, "zwlr_virtual_pointer_manager_v1", 1)
        self.ptr = self._new()
        self._send(mgr, 0, struct.pack("<II", seat, self.ptr))  # create_virtual_pointer

    def _new(self):
        self.next_id += 1
        return self.next_id - 1

    def _send(self, obj, op, payload=b""):
        self.s.sendall(struct.pack("<IHH", obj, op, 8 + len(payload)) + payload)

    def _bind(self, reg, globs, iface, ver):
        gname = globs[iface][0]
        new = self._new()
        s = iface.encode() + b"\0"
        s += b"\0" * (-len(s) % 4)
        self._send(reg, 0, struct.pack("<II", gname, len(iface) + 1) + s + struct.pack("<II", ver, new))
        return new

    @staticmethod
    def _t():
        return int(time.monotonic() * 1000) & 0xFFFFFFFF

    def drain(self):
        # The compositor rarely talks to us; read and discard anything it sends.
        data = self.s.recv(65536)
        if not data:
            raise ConnectionError("compositor closed the connection")

    def move(self, x, y, w, h):
        self._send(self.ptr, 1, struct.pack("<IIIII", self._t(), max(0, min(x, w)), max(0, min(y, h)), w, h))
        self._send(self.ptr, 4)  # frame

    def button(self, pressed):
        self._send(self.ptr, 2, struct.pack("<III", self._t(), BTN_LEFT, 1 if pressed else 0))
        self._send(self.ptr, 4)

    def wheel(self, clicks):
        # One wheel notch = 15 units + 1 discrete step, like a normal mouse.
        self._send(self.ptr, 5, struct.pack("<I", 0))  # axis_source wheel
        self._send(self.ptr, 7, struct.pack("<IIii", self._t(), 0, int(15 * clicks * 256), clicks))  # axis_discrete
        self._send(self.ptr, 4)


# ---------------------------------------------------------------- gestures
def run(dev_path, vp):
    fd = os.open(dev_path, os.O_RDONLY)
    try:
        xlo, xhi = absinfo(fd, ABS_MT_POSITION_X)
        ylo, yhi = absinfo(fd, ABS_MT_POSITION_Y)
        fcntl.ioctl(fd, EVIOCGRAB, 1)
        log(f"grabbed {dev_path} x {xlo}..{xhi} y {ylo}..{yhi}")
        w, h = xhi - xlo, yhi - ylo
        # finger pixels -> touch units, assuming a 1200-px-tall screen
        step = STEP * h / 1200.0

        slots, slot = {}, 0  # slot -> [x, y]
        mode, pressed, last_cy, acc = "idle", False, None, 0.0

        while True:
            r, _, _ = select.select([fd, vp.s], [], [])
            if vp.s in r:
                vp.drain()
            if fd not in r:
                continue
            data = os.read(fd, EVENT.size * 64)
            for i in range(0, len(data), EVENT.size):
                _s, _u, typ, code, val = EVENT.unpack_from(data, i)
                if typ == EV_ABS:
                    if code == ABS_MT_SLOT:
                        slot = val
                    elif code == ABS_MT_TRACKING_ID:
                        if val < 0:
                            slots.pop(slot, None)
                        else:
                            slots[slot] = [None, None]
                    elif code in (ABS_MT_POSITION_X, ABS_MT_POSITION_Y) and slot in slots:
                        slots[slot][code - ABS_MT_POSITION_X] = val
                    continue
                if typ != EV_SYN or code != SYN_REPORT:
                    continue

                pts = [p for p in slots.values() if p[0] is not None and p[1] is not None]
                n = len(pts)
                if mode == "idle" and n >= 1:
                    if n == 1:
                        x, y = pts[0]
                        vp.move(x - xlo, y - ylo, w, h)
                        vp.button(True)
                        pressed, mode = True, "one"
                    else:
                        mode, last_cy, acc = "scroll", sum(p[1] for p in pts) / n, 0.0
                        dbg("scroll start (two fingers together)")
                elif mode == "one":
                    if n == 0:
                        vp.button(False)
                        pressed, mode = False, "idle"
                    elif n == 1:
                        x, y = pts[0]
                        vp.move(x - xlo, y - ylo, w, h)
                    else:
                        if pressed:
                            vp.button(False)
                            pressed = False
                        mode, last_cy, acc = "scroll", sum(p[1] for p in pts) / n, 0.0
                        dbg("scroll start")
                elif mode == "scroll":
                    if n == 0:
                        mode = "idle"
                        dbg("scroll end")
                    elif n >= 2:
                        cy = sum(p[1] for p in pts) / n
                        if last_cy is None:  # second finger came back
                            last_cy = cy
                        acc += cy - last_cy
                        last_cy = cy
                        clicks = int(acc / step)
                        if clicks:
                            acc -= clicks * step
                            # natural: fingers move up -> content moves up -> wheel down
                            vp.wheel(-clicks if NATURAL else clicks)
                            dbg("wheel", -clicks if NATURAL else clicks)
                    else:
                        # one finger left on the glass: no click, wait for all fingers up
                        last_cy = None
    finally:
        os.close(fd)  # also releases the grab


def main():
    vp = VirtualPointer()
    log("virtual pointer ready")
    while True:
        dev, name = find_touchscreen()
        if not dev:
            time.sleep(2)
            continue
        log(f"touchscreen: {name} ({dev})")
        try:
            run(dev, vp)
        except OSError as e:
            if e.errno in (errno.ENODEV, errno.ENOENT, errno.EIO):
                log("touchscreen gone, waiting for it to come back")
                time.sleep(1)
                continue
            raise


if __name__ == "__main__":
    try:
        main()
    except (ConnectionError, BrokenPipeError) as e:
        log(f"wayland connection lost: {e}")
        sys.exit(1)
```

**2. Try it** in a terminal before making it permanent. `timeout` stops it after two minutes, which also gives touch back to labwc:

```
TOUCH_SCROLL_DEBUG=1 timeout 120 ~/.local/bin/touch-scroll
```

You should see `virtual pointer ready`, then `grabbed /dev/input/event4 ...`, then a `wheel` line for each click as you scroll with two fingers.

To change the feel, set `TOUCH_SCROLL_STEP` (screen pixels per wheel click: smaller scrolls faster) or `TOUCH_SCROLL_NATURAL=0` (reverse the direction, like a mouse wheel). In the service below, that's a line such as `Environment=TOUCH_SCROLL_STEP=30`.

**3. Start it at login** with a systemd user service, `~/.config/systemd/user/touch-scroll.service`:

```ini
[Unit]
Description=Two-finger touchscreen scrolling (wheel events via virtual pointer)

[Service]
ExecStart=%h/.local/bin/touch-scroll
Environment=WAYLAND_DISPLAY=wayland-0
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

As in Step 11, use `default.target`. Unlike `osk-autohide`, this helper needs labwc running. If it starts before the desktop is up, it can't connect, and systemd retries every 3 seconds until it can. The same happens if labwc restarts.

```
systemctl --user daemon-reload
systemctl --user enable --now touch-scroll.service
journalctl --user-unit touch-scroll.service -b    # should show "grabbed /dev/input/event4"
```

To turn it off: `systemctl --user disable --now touch-scroll.service`. labwc's mouse emulation takes over again straight away.

*Status: tested on 7 November 2026 with the Mixxx 2.5.6 Flatpak (running under XWayland, Step 12) on labwc 0.20.2: two-finger drags scroll the library in both directions, and one-finger use is unchanged.*

## After a reboot: what starts by itself, and what to do if it doesn't

Once Steps 6, 7, 10, 11, 13, 14 and 17 are done, nothing needs to be run by hand after a reboot. Seven things start on their own when you log in:

| What | How it starts | What it does |
|---|---|---|
| `djm-fix.service` | systemd user service (Step 6) | Handshake and keep-alive, so the mixer sends timecode at all |
| Pro Audio rule | WirePlumber config file (Step 7), read whenever WirePlumber starts or the mixer is plugged in | Puts the mixer on Pro Audio so Mixxx sees "DJM-250MK2 Pro" and deck 2 works |
| `mixxx-startup-port.service` | systemd user service (Step 10) | MIDI port that turns VINYL on when Mixxx starts |
| `osk-autohide.service` | systemd user service (Step 11) | Shows and hides the on-screen keyboard as Mixxx text boxes get and lose focus |
| `mixxx-vinyl-samplerate-fix.service` | systemd user service (Step 13) | Presses Preferences → OK after Mixxx starts, so vinyl control runs at 48 kHz instead of reading -8% |
| `touch-scroll.service` | systemd user service (Step 17) | Turns two-finger drags on the touchscreen into scrolling |
| Mixxx | `~/.config/autostart/mixxx-autostart.desktop` (Step 14) | Waits for the mixer, then starts Mixxx |

The Pro Audio rule is a config file, not a systemd service, and it doesn't need one. WirePlumber is already started by systemd at login, and it applies the rule itself. Before I added the rule, a reboot put the mixer back on "Analog Surround 7.1". Deck 1 still worked, but deck 2's circle disappeared, and it looked like the original bug had come back.

All of these are user services, so they only run while you're logged in (see the note on `loginctl enable-linger` in Step 6).

If something goes wrong after a reboot anyway, check these in order:

```
# 1. Is the mixer on Pro Audio? You want ...pro-input-0 and ...pro-output-0, not "Analog Surround 7.1"
wpctl status | grep -i djm

# 2. If not, force it (pro-audio was profile index 4 for me; check with EnumProfile, see Step 7)
wpctl set-profile $(wpctl status | grep -m1 'DJM-250MK2  .*\[alsa\]' | grep -o '[0-9]\+\.' | head -1 | tr -d .) 4

# 3. Did the handshake happen? Look for "Received acknowledgment" and the two "re-sent" lines
journalctl --user-unit djm-fix.service -b | tail

# 4. If not, redo it
systemctl --user restart djm-fix
```

**Restart Mixxx after either fix.** Mixxx opens its sound device at startup. If the profile changes underneath it, Mixxx keeps the old device that no longer exists. Then check Preferences → Sound Hardware: "DJM-250MK2 Pro", vinyl control 1 on channels 1–2, vinyl control 2 on channels 3–4.

If the circles are back but there's no sound, check the mixer before blaming the Pi: the deck's input selector, faders, and whether anything is actually playing. You can check that Mixxx is sending audio by recording the output's monitor:

```
pw-record -P stream.capture.sink=true \
  --target alsa_output.usb-Pioneer_DJ_Corporation_DJM-250MK2-00.pro-output-0 \
  --channels 8 --channel-map AUX0,AUX1,AUX2,AUX3,AUX4,AUX5,AUX6,AUX7 \
  --format s32 --rate 48000 out.wav     # Ctrl+C after a few seconds
python3 djm-levels.py out.wav           # channels 1-2 = deck 1, 3-4 = deck 2
```

## Troubleshooting checklist

| Symptom | Likely cause and fix |
|---|---|
| All capture channels are exact zeros | djm-fix isn't running, or the handshake didn't complete. Check with `journalctl --user-unit djm-fix.service`. |
| One deck is zeros, the other works | While djm-fix is running, switch that deck's routing to another source and back (Step 4). |
| Deck 2 lost its circle after a reboot | WirePlumber put the mixer back on "Analog Surround 7.1". Add the Pro Audio rule (Step 7), or force the profile now and restart Mixxx (see "After a reboot"). |
| Circles are back but there's no sound from the mixer | Usually on the mixer side (input selector, faders, nothing playing). Check Mixxx's output with `pw-record` (see "After a reboot"). |
| Timecode is fine in a recording, but one Mixxx deck shows no circle | The mixer is on "Analog Surround 7.1". Switch to Pro Audio and select "DJM-250MK2 Pro" in Mixxx (Steps 7–8). |
| `pw-record` shows channels 3–4 as zeros on Pro Audio | Missing `--channel-map AUX0,...,AUX7` (Step 5). Check with raw `arecord` before assuming the mixer is at fault. |
| Low noise but no 1 kHz tone | Records aren't playing, or the wrong input (PHONO vs LINE) or the wrong channel selector is in use on the mixer |
| djm-fix says "No card with matching name found" | Mixer not plugged in or powered on, or the name pattern doesn't match (`cat /proc/asound/cards`) |
| djm-fix sends a greeting but gets no reply | Restart it. This happened to me once: the retry 15 seconds later worked. The autostart script retries automatically. |
| Signal is fine in `arecord` but Mixxx shows nothing | No Vinyl Control inputs assigned in Sound Hardware, the wrong PipeWire profile, or the VINYL button is off on the deck. In Mixxx, compare the signal boxes in Preferences → Vinyl Control. |
| A deck's BPM jumps up (e.g. 124 → 160) when the record plays | The turntable is on 45 RPM: Mixxx shows the track BPM times the speed it reads from the timecode. Press 33. To check the real speed, the carrier should be ~1000 Hz at 33⅓ RPM (the level script in Step 5 shows it). |
| Scratching feels laggy | PipeWire's default 1024-sample buffer. Set `PIPEWIRE_QUANTUM` for the Mixxx Flatpak and use the Alpha-Beta pitch estimator (Step 9). |
| Crackles, or the ERR count in `pw-top` keeps climbing | PipeWire lacks real-time priority. Add yourself to the `pipewire` group, or use a bigger buffer (Step 9). |
| VINYL is off every time Mixxx starts | That's by design in Mixxx. Use the startup mapping (Step 10). |
| Touchscreen doesn't work, nothing in `lsusb` | The screen isn't getting enough power for its touch controller. Power it from its own supply, not a Pi USB port, and use a data cable in the full-function USB-C socket (Step 11). |
| No on-screen keyboard at all | squeekboard's Autodetect only checks for a touchscreen at login. Set it to always on (Step 11). |
| Keyboard stays up in Mixxx, or pops up when you tap a deck | `osk-autohide` isn't running, or Mixxx was started without `QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1` (Step 11). |
| A two-finger drag doesn't scroll, it just drags or selects | `touch-scroll` isn't running. Check `journalctl --user-unit touch-scroll.service` for "grabbed" (Step 17). |
| Mixxx uses lots of CPU; `top -H` shows `llvmpipe` threads | Mixxx is drawing in software. Run the Flatpak through XWayland (Step 12). |
| VINYL doesn't come on at startup even though the mapping is enabled | An old fixed-delay script fires before Mixxx is ready. Use the retrying script (Step 10). Debug with `--controller-debug`. |
| Both decks read about -8% with the records at 33⅓ | Mixxx 2.5.6 started its timecode decoders at 44.1 kHz. Press OK in Preferences after starting, or use the helper (Step 13). |
| New tracks keep the previous deck's tempo | The tempo isn't reset when a track loads. Set it to reset key and tempo (Step 10). |
| All of Mixxx's preferences are back to defaults | `mixxx.cfg` was reset, probably after Mixxx was killed instead of closed. Restore your backup with Mixxx closed (Step 16). |
| Mixxx window is blank after installing a copied skin, or the copy looks unchanged | The copy still uses `skins:Deere/...` paths. Change them to `skin:` (Step 15). |
| The VINYL buttons aren't on screen | Deere hides the vinyl section; turn it on in the View menu, or use Deere Touch, which always shows it (Steps 8 and 15). |
| Mixxx can't use the DJM's MIDI | djm-fix holds the MIDI port exclusively. This is a known limitation. |

## Credits

All the hard work, both the kernel driver and the reverse-engineered handshake, is by **František Kučera** ([frantovo.cz](https://blog.frantovo.cz/)). The handshake analysis builds on the public [CDJ HID protocol notes](https://swiftb0y.github.io/CDJHidProtocol/hid-analysis/handshake.html). djm-fix is GPLv3.
