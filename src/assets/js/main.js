(function (window, document, $, undefined) {
  "use strict";

  var lernhub = {
    _heroGradientStops: [
      { stop: 0, color: "#b26ef7" },
      { stop: 0.465, color: "#ff71bf" },
      { stop: 1, color: "#ffbd7a" },
    ],

    i: function () {
      lernhub.d();
      lernhub.methods();
    },

    d: function () {
      this._window = $(window);
      this._document = $(document);
      this._body = $("body");
      this._html = $("html");
    },

    methods: function () {
      lernhub.headerSticky();
      lernhub.splashHeroSlider();
      lernhub.popupMobileMenu();
      lernhub.textAnimation();
      lernhub.odometerCounter();
      lernhub.whyChooseAnimation();
      lernhub.serviceIllustrationAnimation();
      lernhub.layoutScrollActive();
      lernhub.reviewMarquee();
      lernhub.galleryAnimation();
    },

    initGsap: function () {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        return false;
      }

      if (!lernhub._gsapReady) {
        gsap.registerPlugin(ScrollTrigger);
        lernhub._gsapReady = true;
      }

      return true;
    },

    getHeroGradientColor: function (t) {
      const stops = lernhub._heroGradientStops;

      for (let i = 0; i < stops.length - 1; i++) {
        const current = stops[i];
        const next = stops[i + 1];

        if (t >= current.stop && t <= next.stop) {
          const localT = (t - current.stop) / (next.stop - current.stop);
          return gsap.utils.interpolate(current.color, next.color)(localT);
        }
      }

      return stops[stops.length - 1].color;
    },

    applyHeroCharGradient: function (chars) {
      if (!chars.length) {
        return;
      }

      gsap.set(chars, {
        color: (i, t, allChars) => {
          const progress = allChars.length > 1 ? i / (allChars.length - 1) : 0;
          return lernhub.getHeroGradientColor(progress);
        },
      });
    },

    headerSticky: function () {
      $(window).scroll(function () {
        if ($(this).scrollTop() > 250) {
          $(".header-sticky").addClass("sticky");
        } else {
          $(".header-sticky").removeClass("sticky");
        }
      });
    },

    splashHeroSlider: function () {
      if (!$(".lrn-splash-hero-slider").length) {
        return;
      }

      const heroGradientText = document.querySelector(
        ".lrn-splash-hero .lrn-hero-title-text",
      );
      const heroTitles = Array.from(
        document.querySelectorAll(".lrn-splash-hero-slider .swiper-slide"),
      ).map((slide) => slide.dataset.heroTitle);

      let heroTitleTimeline = null;
      let heroTitleSplit = null;
      let currentHeroTitle = "";
      const hasHeroAnimation =
        lernhub.initGsap() && typeof SplitText !== "undefined";

      if (hasHeroAnimation) {
        gsap.registerPlugin(SplitText);
      }

      const revertHeroTitleSplit = () => {
        if (heroTitleSplit) {
          heroTitleSplit.revert();
          heroTitleSplit = null;
        }

        heroGradientText?.classList.remove("is-split");
      };

      const splitHeroTitle = () => {
        revertHeroTitleSplit();
        heroTitleSplit = new SplitText(heroGradientText, {
          type: "chars",
          charsClass: "hero-char",
        });
        heroGradientText.classList.add("is-split");
        lernhub.applyHeroCharGradient(heroTitleSplit.chars);
        return heroTitleSplit.chars;
      };

      const animateHeroTitle = (title, isInitial = false) => {
        if (!heroGradientText || !title) {
          return;
        }

        if (title === currentHeroTitle && !isInitial) {
          return;
        }

        if (heroTitleTimeline) {
          heroTitleTimeline.kill();
          heroTitleTimeline = null;
        }

        if (!hasHeroAnimation) {
          revertHeroTitleSplit();
          heroGradientText.textContent = title;
          currentHeroTitle = title;
          return;
        }

        const prevTitle = currentHeroTitle;
        let outChars = null;

        if (!isInitial && prevTitle && prevTitle !== title) {
          if (heroTitleSplit?.chars?.length) {
            outChars = Array.from(heroTitleSplit.chars);
          } else {
            revertHeroTitleSplit();
            heroGradientText.textContent = prevTitle;
            outChars = Array.from(splitHeroTitle());
          }
        }

        const tl = gsap.timeline({
          onComplete: () => {
            if (heroTitleTimeline === tl) {
              heroTitleTimeline = null;
            }
          },
        });
        heroTitleTimeline = tl;

        if (outChars?.length) {
          tl.to(outChars, {
            yPercent: -100,
            autoAlpha: 0,
            rotateX: 45,
            transformOrigin: "50% 0%",
            duration: 0.25,
            ease: "power2.in",
            stagger: {
              each: 0.012,
              from: "start",
            },
          });
        }

        tl.add(() => {
          revertHeroTitleSplit();
          heroGradientText.textContent = title;
          currentHeroTitle = title;

          const chars = splitHeroTitle();
          if (!chars.length) {
            return;
          }

          gsap.set(chars, {
            yPercent: 110,
            autoAlpha: 0,
            rotateX: -45,
            transformOrigin: "50% 100%",
          });

          tl.to(chars, {
            yPercent: 0,
            autoAlpha: 1,
            rotateX: 0,
            duration: isInitial ? 0.8 : 0.55,
            ease: "power3.out",
            stagger: {
              each: 0.025,
              from: "start",
            },
          });
        });
      };

      const updateHeroTitle = (swiper, isInitial = false) => {
        const title = heroTitles[swiper.realIndex];
        animateHeroTitle(title, isInitial);
      };

      new Swiper(".lrn-splash-hero-slider", {
        effect: "coverflow",
        grabCursor: true,
        slidesPerView: "auto",
        centeredSlides: true,
        loop: true,
        spaceBetween: 0,
        watchSlidesProgress: true,
        speed: 700,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
        },
        coverflowEffect: {
          slideShadows: false,
          rotate: 0,
          stretch: 0,
          depth: 0,
          modifier: 1,
        },
        breakpoints: {
          576: {
            spaceBetween: -150,
            coverflowEffect: {
              rotate: 0,
              stretch: -100,
              depth: 100,
              modifier: 1,
            },
          },
          768: {
            spaceBetween: -150,
            coverflowEffect: {
              rotate: 0,
              stretch: -120,
              depth: 105,
              modifier: 1,
            },
          },
          1200: {
            spaceBetween: -180,
            coverflowEffect: {
              rotate: 0,
              stretch: -120,
              depth: 120,
              modifier: 1,
            },
          },
        },
        on: {
          init(swiper) {
            updateHeroTitle(swiper, true);
          },
          slideChangeTransitionStart(swiper) {
            updateHeroTitle(swiper);
          },
          progress(swiper) {
            const visibleRadius = window.innerWidth < 768 ? 1.4 : 3.2;
            const edgePullBase = window.innerWidth < 768 ? 120 : 210;

            swiper.slides.forEach((slideEl) => {
              const distance = Math.abs(slideEl.progress);

              slideEl.classList.remove(
                "is-hero-near",
                "is-hero-far",
                "is-hero-hidden",
              );
              slideEl.style.removeProperty("--hero-edge-pull");
              slideEl.style.removeProperty("--hero-edge-dir");

              if (distance > visibleRadius + 0.35) {
                slideEl.classList.add("is-hero-hidden");
              } else if (distance > 1.15) {
                slideEl.classList.add("is-hero-far");
                const pull = edgePullBase + Math.min(distance - 1.15, 1) * 90;
                const direction = slideEl.progress > 0 ? -1 : 1;

                slideEl.style.setProperty("--hero-edge-pull", `${pull}px`);
                slideEl.style.setProperty("--hero-edge-dir", `${direction}`);
              } else if (distance > 0.15) {
                slideEl.classList.add("is-hero-near");
              }
            });
          },
          setTransition(swiper, duration) {
            swiper.slides.forEach((slideEl) => {
              slideEl.style.transitionDuration = `${duration}ms`;
            });
          },
        },
      });
    },

    textAnimation: function () {
      if (!lernhub.initGsap() || typeof SplitText === "undefined") {
        return;
      }

      gsap.registerPlugin(SplitText);

      const gradientStops = [
        { stop: 0, color: "#9E7AFF" },
        { stop: 0.32, color: "#FE8BBB" },
        { stop: 0.655, color: "#FFBD7A" },
        { stop: 1, color: "#FEE398" },
      ];

      function getGradientColor(t) {
        for (let i = 0; i < gradientStops.length - 1; i++) {
          const current = gradientStops[i];
          const next = gradientStops[i + 1];
          if (t >= current.stop && t <= next.stop) {
            const localT = (t - current.stop) / (next.stop - current.stop);
            return gsap.utils.interpolate(current.color, next.color)(localT);
          }
        }
        return gradientStops[gradientStops.length - 1].color;
      }

      document.querySelectorAll(".lrn-text-animation").forEach((heading) => {
        const split = new SplitText(heading, {
          type: "lines,words,chars",
          linesClass: "reveal-parent",
          wordsClass: "word",
          charsClass: "reveal-child",
        });

        if (!split.chars.length) {
          return;
        }

        gsap.set(heading, { visibility: "visible" });

        const gradientTarget = heading.querySelector(".lrn-gradient-splite");
        if (gradientTarget) {
          const gradientSplit = new SplitText(gradientTarget, {
            type: "chars",
          });

          if (gradientSplit.chars.length) {
            gsap.set(gradientSplit.chars, {
              color: (i, t, chars) => {
                const progress = chars.length > 1 ? i / (chars.length - 1) : 0;
                return getGradientColor(progress);
              },
            });
          }
        }

        gsap.from(split.chars, {
          scrollTrigger: {
            trigger: heading,
            start: "top 100%",
            once: true,
          },
          duration: 0.5,
          yPercent: 10,
          opacity: 0,
          ease: "power4.out",
          stagger: 0.025,
        });
      });
    },

    reviewMarquee: function () {
      const MARQUEE_MIN_WIDTH = 1200;

      const initTrack = (track) => {
        const cards = track.querySelectorAll(
          ".lrn-review-card:not(.lrn-review-card--clone)",
        );

        track.querySelectorAll(".lrn-review-card--clone").forEach((clone) => {
          clone.remove();
        });
        track.style.transform = "";

        if (window.innerWidth < MARQUEE_MIN_WIDTH) {
          return;
        }

        cards.forEach((card) => {
          const clone = card.cloneNode(true);
          clone.classList.add("lrn-review-card--clone");
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      };

      const tracks = document.querySelectorAll(".lrn-review-marquee-track");

      if (!tracks.length) {
        return;
      }

      tracks.forEach(initTrack);

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          tracks.forEach(initTrack);
        }, 150);
      });
    },

    whyChooseAnimation: function () {
      if (!lernhub.initGsap()) {
        return;
      }

      var section = document.querySelector(".lrn-splash-why-choose");
      if (!section) {
        return;
      }

      var cards = gsap.utils.toArray(".lrn-splash-why-choose-card");
      if (!cards.length) {
        return;
      }

      var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        section.classList.add("is-animated");
        return;
      }

      cards.forEach(function (card) {
        var cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });

        cardTl.fromTo(
          card,
          { autoAlpha: 0, y: 48, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
          },
        );

        if (
          card.classList.contains("lrn-splash-why-choose-card--performance")
        ) {
          var scoreWrap = card.querySelector(".score-wrap");
          var scoreBadge = card.querySelector(".score-badge");
          var cardTitle = card.querySelector(".card-title");
          var cardBg = card.querySelector(".card-bg");

          if (scoreWrap) {
            cardTl.from(
              scoreWrap,
              {
                scale: 0.4,
                rotation: -120,
                autoAlpha: 0,
                duration: 0.75,
                ease: "back.out(1.5)",
              },
              "-=0.45",
            );
          }
          if (scoreBadge) {
            cardTl.from(
              scoreBadge,
              { scale: 0, autoAlpha: 0, duration: 0.45, ease: "back.out(2.2)" },
              "-=0.55",
            );
          }
          if (cardTitle) {
            cardTl.from(
              cardTitle,
              { y: 24, autoAlpha: 0, duration: 0.55, ease: "power2.out" },
              "-=0.35",
            );
          }
          if (cardBg) {
            cardTl.from(
              cardBg,
              { y: 40, autoAlpha: 0, duration: 0.85, ease: "power2.out" },
              "-=0.75",
            );
          }
        }

        if (card.classList.contains("lrn-splash-why-choose-card--support")) {
          var supportImg = card.querySelector(".support-img");
          var supportOverlay = card.querySelector(".support-overlay");
          var supportTitle = card.querySelector(".card-title");

          if (supportImg) {
            cardTl.from(
              supportImg,
              { scale: 1.12, autoAlpha: 0, duration: 0.9, ease: "power2.out" },
              "-=0.55",
            );
          }
          if (supportOverlay) {
            cardTl.from(
              supportOverlay,
              { autoAlpha: 0, duration: 0.6, ease: "power1.out" },
              "-=0.7",
            );
          }
          if (supportTitle) {
            cardTl.from(
              supportTitle,
              { autoAlpha: 0, duration: 0.6, ease: "power2.out" },
              "-=0.35",
            );
          }
        }

        if (card.classList.contains("lrn-splash-why-choose-card--design")) {
          var designBg = card.querySelector(".design-bg");
          var lightning = card.querySelector(".lightning");
          var designTitle = card.querySelector(".card-title");

          if (designBg) {
            cardTl.from(
              designBg,
              { scale: 1.08, autoAlpha: 0, duration: 0.85, ease: "power2.out" },
              "-=0.55",
            );
          }
          if (lightning) {
            cardTl.from(
              lightning,
              {
                scale: 0,
                rotation: -30,
                autoAlpha: 0,
                duration: 0.55,
                ease: "back.out(2)",
              },
              "-=0.45",
            );
          }
          if (designTitle) {
            cardTl.from(
              designTitle,
              { x: 32, autoAlpha: 0, duration: 0.55, ease: "power2.out" },
              "-=0.35",
            );
          }
        }

        if (card.classList.contains("lrn-splash-why-choose-card--mobile")) {
          var mobileImg = card.querySelector(".mobile-img");
          var cardLabel = card.querySelector(".card-label");
          var mobileTitle = card.querySelector(".card-title");

          if (mobileImg) {
            cardTl.from(
              mobileImg,
              { y: 36, autoAlpha: 0, duration: 0.75, ease: "power2.out" },
              "-=0.45",
            );
          }
          if (cardLabel) {
            cardTl.from(
              cardLabel,
              { y: 16, autoAlpha: 0, duration: 0.45, ease: "power2.out" },
              "-=0.35",
            );
          }
          if (mobileTitle) {
            cardTl.from(
              mobileTitle,
              { y: 20, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
              "-=0.3",
            );
          }
        }

        if (card.classList.contains("lrn-splash-why-choose-card--brand")) {
          var gridLines = card.querySelector(".grid-lines");
          var windowDots = card.querySelector(".window-dots");
          var brandLogo = card.querySelector(".brand-logo");
          var brandItems = card.querySelectorAll(".brand-features li");

          if (gridLines) {
            cardTl.from(
              gridLines,
              { autoAlpha: 0, duration: 0.7, ease: "power1.out" },
              "-=0.5",
            );
          }
          if (windowDots) {
            cardTl.from(
              windowDots,
              { y: -12, autoAlpha: 0, duration: 0.45, ease: "power2.out" },
              "-=0.55",
            );
          }
          if (brandLogo) {
            cardTl.from(
              brandLogo,
              { y: -20, autoAlpha: 0, duration: 0.6, ease: "power2.out" },
              "-=0.35",
            );
          }
          if (brandItems.length) {
            cardTl.from(
              brandItems,
              {
                x: -16,
                autoAlpha: 0,
                duration: 0.45,
                ease: "power2.out",
                stagger: 0.1,
              },
              "-=0.25",
            );
          }
        }

        if (card.classList.contains("lrn-splash-why-choose-card--elements")) {
          var elementsBg = card.querySelector(".elements-bg");
          var countEl = card.querySelector(".count");
          var elementsTitle = card.querySelector(".card-title");

          if (elementsBg) {
            cardTl.from(
              elementsBg,
              { scale: 1.1, autoAlpha: 0, duration: 0.8, ease: "power2.out" },
              "-=0.5",
            );
          }
          if (countEl) {
            cardTl.from(
              countEl,
              {
                scale: 0.6,
                autoAlpha: 0,
                duration: 0.55,
                ease: "back.out(1.6)",
              },
              "-=0.4",
            );
          }
          if (elementsTitle) {
            cardTl.from(
              elementsTitle,
              { y: 18, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
              "-=0.25",
            );
          }
        }

        cardTl.eventCallback("onComplete", function () {
          card.classList.add("is-visible");
        });
      });

      var grid =
        section.querySelector(".lrn-splash-why-choose-grid") || section;

      ScrollTrigger.create({
        trigger: grid,
        start: "top 85%",
        once: true,
        onEnter: function () {
          section.classList.add("is-animated");
        },
      });
    },

    odometerCounter: function () {
      if (typeof Odometer === "undefined" || !lernhub.initGsap()) {
        return;
      }

      document.querySelectorAll(".odometer[data-count]").forEach(function (el) {
        if (!el.odometer) {
          el.odometer = new Odometer({
            el: el,
            value: el.textContent || 0,
          });
        }

        var countNumber = el.getAttribute("data-count");
        var trigger = el.closest(".lrn-splash-why-choose-card") || el;

        if (!trigger) {
          return;
        }

        ScrollTrigger.create({
          trigger: trigger,
          start: "top 85%",
          once: true,
          onEnter: function () {
            if (el.odometer) {
              el.odometer.update(countNumber);
            } else {
              $(el).html(countNumber);
            }
          },
        });
      });
    },

    galleryAnimation: function () {
      if (typeof gsap === "undefined") {
        return;
      }

      var stage = document.querySelector(".lrn-gallery-stage");
      if (!stage) {
        return;
      }

      var featuredImg = stage.querySelector(".lrn-gallery-featured-img");
      var scatterItems = stage.querySelectorAll(".lrn-gallery-scatter");
      if (!featuredImg || !scatterItems.length) {
        return;
      }

      var sources = Array.prototype.map.call(scatterItems, function (img) {
        return {
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt"),
        };
      });

      var currentIndex = -1;
      var changeEvery = 4000;

      sources.some(function (source, index) {
        var initialSrc = featuredImg.getAttribute("src") || "";
        if (
          initialSrc === source.src ||
          featuredImg.src.indexOf(source.src) !== -1
        ) {
          currentIndex = index;
          return true;
        }
        return false;
      });

      gsap.set(featuredImg, { opacity: 1, y: 0 });

      function getNextIndex() {
        if (sources.length < 2) {
          return 0;
        }

        return (currentIndex + 1) % sources.length;
      }

      function revealFeatured(next) {
        featuredImg.src = next.src;
        featuredImg.alt = next.alt;

        gsap.fromTo(
          featuredImg,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
        );
      }

      function updateFeatured() {
        gsap.killTweensOf(featuredImg);

        var nextIndex = getNextIndex();
        var next = sources[nextIndex];
        currentIndex = nextIndex;

        gsap.to(featuredImg, {
          opacity: 0,
          y: 50,
          duration: 0.35,
          ease: "power2.in",
          onComplete: function () {
            gsap.set(featuredImg, { y: 0 });
            revealFeatured(next);
          },
        });
      }

      window.setInterval(updateFeatured, changeEvery);
    },

    serviceIllustrationAnimation: function () {
      var illustration = document.querySelector(".lrn-service-illustration");
      if (!illustration) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        illustration.classList.add("is-visible");
        return;
      }

      if (!lernhub.initGsap()) {
        illustration.classList.add("is-visible");
        return;
      }

      ScrollTrigger.create({
        trigger: illustration,
        start: "top 85%",
        toggleClass: "is-visible",
        once: true,
      });
    },

    layoutScrollActive: function () {
      if (!lernhub.initGsap()) {
        return;
      }

      gsap.utils.toArray(".lrn-add-scroll-ac").forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          toggleClass: "active",
          once: true,
        });
      });
    },

    popupMobileMenu: function () {
      $(".hamberger-button").on("click", function () {
        $(".popup-mobile-menu").addClass("active");
      });

      $(".close-button").on("click", function () {
        $(".popup-mobile-menu").removeClass("active");
        $(
          ".popup-mobile-menu .mainmenu .has-dropdown > a, .popup-mobile-menu .mainmenu .with-megamenu > a, .popup-mobile-menu .mainmenu .has-menu-child-item > a, .popup-mobile-menu .mainmenu .has-menu-childitem > a",
        )
          .siblings(".submenu, .lrn-megamenu")
          .removeClass("active")
          .slideUp("400");
        $(
          ".popup-mobile-menu .mainmenu .has-dropdown > a, .popup-mobile-menu .mainmenu .with-megamenu > a, .popup-mobile-menu .mainmenu .has-menu-child-item > a, .popup-mobile-menu .mainmenu .has-menu-childitem > a",
        ).removeClass("open");
      });

      $(
        ".popup-mobile-menu .mainmenu .has-dropdown > a, .popup-mobile-menu .mainmenu .with-megamenu > a, .popup-mobile-menu .mainmenu .has-menu-child-item > a, .popup-mobile-menu .mainmenu .has-menu-childitem > a",
      ).on("click", function (e) {
        e.preventDefault();
        $(this)
          .siblings(".submenu, .lrn-megamenu")
          .toggleClass("active")
          .slideToggle("400");
        $(this).toggleClass("open");
      });

      $(".popup-mobile-menu, .popup-mobile-menu .mainmenu.onepagenav li a").on(
        "click",
        function (e) {
          e.target === this &&
            $(".popup-mobile-menu").removeClass("active") &&
            $(
              ".popup-mobile-menu .mainmenu .has-dropdown > a, .popup-mobile-menu .mainmenu .with-megamenu > a, .popup-mobile-menu .mainmenu .has-menu-child-item > a, .popup-mobile-menu .mainmenu .has-menu-childitem > a",
            )
              .siblings(".submenu, .lrn-megamenu")
              .removeClass("active")
              .slideUp("400") &&
            $(
              ".popup-mobile-menu .mainmenu .has-dropdown > a, .popup-mobile-menu .mainmenu .with-megamenu > a, .popup-mobile-menu .mainmenu .has-menu-child-item > a, .popup-mobile-menu .mainmenu .has-menu-childitem > a",
            ).removeClass("open");
        },
      );
    },
  };

  lernhub.i();
})(window, document, jQuery);
