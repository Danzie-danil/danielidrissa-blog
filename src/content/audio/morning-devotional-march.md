---
title: "Morning Devotional: March 2026"
date: 2026-03-01
duration: "12:34"
audioFile: "/assets/audio/morning-devotional-march-2026.mp3"
speaker: "Daniel Idrissa"
description: "A reflective morning meditation on Psalm 23 and God's shepherd heart."
tags: ["devotional", "psalms", "meditation"]
layout: layouts/base.njk
---

<div class="container">
  <header class="post-header">
    <h1 class="post-title">{{ title }}</h1>
    <div class="post-meta">
      <div class="post-meta-item">
        <time datetime="{{ date | htmlDateString }}">{{ date | readableDate }}</time>
      </div>
      <div class="post-meta-item">
        <span>{{ speaker }}</span>
      </div>
      {% if duration %}
      <div class="post-meta-item">
        <span>Duration: {{ duration }}</span>
      </div>
      {% endif %}
    </div>
  </header>

  <div class="post-content">

  ## Listen

  <div class="audio-player-container">
    <div class="audio-player-title">{{ title }}</div>
    <audio controls class="audio-player">
      <source src="{{ audioFile }}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>

  ## Transcript

  *Good morning, friends.*

  Today I want us to sit with one of the most beloved passages of Scripture: Psalm 23. But I want us to hear it fresh...

  *The Lord is my shepherd; I shall not want.*

  When we think of a shepherd, we often think of someone leading from the front. But the imagery here is also about provision. A shepherd ensures the sheep have exactly what they need for each step of the journey.

  [Full transcript continues...]

  </div>
</div>
