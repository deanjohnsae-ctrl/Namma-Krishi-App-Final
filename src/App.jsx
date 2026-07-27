import { useEffect, useMemo, useRef, useState } from "react";
import {
  assets,
  categories,
  commoditiesByCategory,
  marketOptions,
  priceCards,
  searchResults,
  varietyOptions,
} from "./data";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  getLocaleConfig,
  getLocalizedText,
} from "./locales";

const RESULTS_LOADING_DELAY_MS = 320;

function getDefaultCommodityId(categoryId) {
  return commoditiesByCategory[categoryId]?.[0]?.id ?? "";
}

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function parseDate(value) {
  if (!value) return null;

  const [day, month, year] = value.split("-").map(Number);
  if (!day || !month || !year) return null;

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDaysSince(value) {
  const parsed = parseDate(value);
  if (!parsed) return null;

  const now = new Date();
  const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const normalizedParsed = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );

  return Math.max(
    0,
    Math.floor((normalizedNow.getTime() - normalizedParsed.getTime()) / 86400000),
  );
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function getLocalizedSearchHaystack(value) {
  if (value == null) return [];
  if (typeof value === "string") return [normalizeText(value)];

  return Object.values(value)
    .filter(Boolean)
    .map((item) => normalizeText(item));
}

function useIsMobileSearchViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event) => setIsMobileViewport(event.matches);

    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isMobileViewport;
}

function useDialogAccessibility(isOpen, dialogRef, onClose, returnFocusRef) {
  useEffect(() => {
    if (!isOpen) {
      const returnTarget = returnFocusRef.current;
      if (returnTarget && typeof returnTarget.focus === "function") {
        requestAnimationFrame(() => returnTarget.focus());
      }
      return undefined;
    }

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const frameId = requestAnimationFrame(() => {
      if (dialog.contains(document.activeElement)) return;
      const [firstFocusable] = getFocusableElements(dialog);
      (firstFocusable || dialog).focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogRef, isOpen, onClose, returnFocusRef]);
}

function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE;
  });
  const copy = getLocaleConfig(language);
  const initialCategoryId = categories[0].id;
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [searchSelection, setSearchSelection] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedCommodityId, setSelectedCommodityId] = useState(
    getDefaultCommodityId(initialCategoryId),
  );
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedVarieties, setSelectedVarieties] = useState([]);
  const [draftSelectedMarkets, setDraftSelectedMarkets] = useState([]);
  const [draftSelectedVarieties, setDraftSelectedVarieties] = useState([]);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState("");
  const [resultsStatus, setResultsStatus] = useState("idle");
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const searchDialogRef = useRef(null);
  const filterDialogRef = useRef(null);
  const searchReturnFocusRef = useRef(null);
  const filterReturnFocusRef = useRef(null);
  const resultsTransitionKeyRef = useRef("");

  const commodityLookup = useMemo(() => {
    return Object.values(commoditiesByCategory)
      .flat()
      .reduce((lookup, item) => {
        lookup[item.id] = item;
        return lookup;
      }, {});
  }, []);

  const marketLookup = useMemo(() => {
    return marketOptions.reduce((lookup, item) => {
      lookup[item.id] = item;
      return lookup;
    }, {});
  }, []);

  const varietyLookup = useMemo(() => {
    return varietyOptions.reduce((lookup, item) => {
      lookup[item.id] = item;
      return lookup;
    }, {});
  }, []);

  const selectionLookup = useMemo(
    () => ({
      Commodity: commodityLookup,
      Market: marketLookup,
      Variety: varietyLookup,
    }),
    [commodityLookup, marketLookup, varietyLookup],
  );

  const getSelectionLabel = (selection, activeLanguage) => {
    if (!selection) return "";

    const entity = selectionLookup[selection.kind]?.[selection.id];
    const labelValue = entity?.label ?? entity?.title;
    return getLocalizedText(labelValue, activeLanguage);
  };

  const resolveSearchSelection = (rawValue) => {
    const normalizedValue = normalizeText(rawValue);
    if (!normalizedValue) return null;

    const exactMatch = searchResults.find((item) =>
      getLocalizedSearchHaystack(item.title).includes(normalizedValue),
    );

    return exactMatch
      ? { kind: exactMatch.kind, id: exactMatch.id }
      : null;
  };

  const formatDateLabel = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return copy.cards.dataUnavailable;

    return new Intl.DateTimeFormat(language === "kn" ? "kn-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  };

  const getFreshnessMeta = (value, statusOverride) => {
    if (statusOverride === "stale") {
      return { tone: "stale", label: copy.cards.freshness.stale };
    }

    const daysSince = getDaysSince(value);
    if (daysSince === null) {
      return { tone: "muted", label: copy.cards.freshness.muted };
    }

    if (daysSince <= 1) {
      return { tone: "fresh", label: copy.cards.freshness.fresh };
    }

    if (daysSince <= 7) {
      return { tone: "aging", label: copy.cards.freshness.aging };
    }

    return { tone: "stale", label: copy.cards.freshness.stale };
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "kn" ? "kn" : "en";
    document.title = copy.browserTitle;
  }, [copy.browserTitle, language]);

  useEffect(() => {
    const overlayOpen = searchOpen || filterOpen;
    if (!overlayOpen) return undefined;

    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const previousBodyStyles = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };
    const previousHtmlOverflow = htmlStyle.overflow;

    htmlStyle.overflow = "hidden";
    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = "100%";

    return () => {
      htmlStyle.overflow = previousHtmlOverflow;
      bodyStyle.overflow = previousBodyStyles.overflow;
      bodyStyle.position = previousBodyStyles.position;
      bodyStyle.top = previousBodyStyles.top;
      bodyStyle.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [filterOpen, searchOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!searchSelection) return;

    const localizedLabel = getSelectionLabel(searchSelection, language);
    if (!localizedLabel) return;

    setQuery((current) => (current ? localizedLabel : current));
    setDraftQuery((current) => (current ? localizedLabel : current));
  }, [getSelectionLabel, language, searchSelection]);

  useEffect(() => {
    if (view !== "results") {
      setResultsStatus("idle");
      resultsTransitionKeyRef.current = "";
      return undefined;
    }

    const nextKey = JSON.stringify([
      query,
      selectedCommodityId,
      selectedMarkets,
      selectedVarieties,
      language,
    ]);

    if (resultsTransitionKeyRef.current === nextKey) {
      return undefined;
    }

    resultsTransitionKeyRef.current = nextKey;
    setResultsStatus("loading");

    const timerId = window.setTimeout(() => {
      setResultsStatus("ready");
    }, RESULTS_LOADING_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [language, query, selectedCommodityId, selectedMarkets, selectedVarieties, view]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchFeedback("");
  };

  const closeFilter = () => {
    setFilterOpen(false);
  };

  useDialogAccessibility(searchOpen, searchDialogRef, closeSearch, searchReturnFocusRef);
  useDialogAccessibility(filterOpen, filterDialogRef, closeFilter, filterReturnFocusRef);

  const categoryCommodities = useMemo(() => {
    return commoditiesByCategory[selectedCategoryId] ?? [];
  }, [selectedCategoryId]);

  const getCardSearchableText = (card) => {
    const values = [
      commodityLookup[card.commodityId]?.label,
      card.marketLabel,
      varietyLookup[card.varietyId]?.label,
      card.grade,
    ];

    return values.flatMap((value) => getLocalizedSearchHaystack(value));
  };

  const queryMatchedResults = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return [];

    return priceCards.filter((card) =>
      getCardSearchableText(card).some((item) => item.includes(normalizedQuery)),
    );
  }, [commodityLookup, query, varietyLookup]);

  const filteredResults = useMemo(() => {
    return queryMatchedResults.filter((card) => {
      const matchesMarket =
        selectedMarkets.length === 0 || selectedMarkets.includes(card.marketId);
      const matchesVariety =
        selectedVarieties.length === 0 || selectedVarieties.includes(card.varietyId);

      return matchesMarket && matchesVariety;
    });
  }, [queryMatchedResults, selectedMarkets, selectedVarieties]);

  const searchSuggestionRows = useMemo(() => {
    const normalizedQuery = normalizeText(draftQuery);

    if (!normalizedQuery) {
      return searchResults;
    }

    return searchResults.filter((item) =>
      getLocalizedSearchHaystack(item.title).some((value) =>
        value.includes(normalizedQuery),
      ),
    );
  }, [draftQuery]);

  const activeFilterCount = selectedMarkets.length + selectedVarieties.length;
  const selectedCommodityLabel = getLocalizedText(
    commodityLookup[selectedCommodityId]?.label,
    language,
  );
  const resultsHeading = query || selectedCommodityLabel;
  const showFilterSummary =
    view === "results" && (selectedMarkets.length > 0 || selectedVarieties.length > 0);

  const resultsViewState = useMemo(() => {
    if (view !== "results") return "idle";
    if (resultsStatus === "loading") return "loading";
    if (filteredResults.length > 0) return "ready";
    if (queryMatchedResults.length === 0) return "no-data";
    if (activeFilterCount > 0) return "filtered-out";
    return "no-data";
  }, [activeFilterCount, filteredResults.length, queryMatchedResults.length, resultsStatus, view]);

  const commitSearch = (rawValue, options = {}) => {
    const nextQuery = rawValue.trim();

    if (!nextQuery) {
      setSearchFeedback(copy.search.blankFeedback);
      setSearchOpen(true);
      return;
    }

    const resolvedSelection =
      options.kind && options.id
        ? { kind: options.kind, id: options.id }
        : resolveSearchSelection(nextQuery);

    if (resolvedSelection?.kind === "Commodity") {
      setSelectedCommodityId(resolvedSelection.id);
    }

    setSearchSelection(resolvedSelection);
    setQuery(nextQuery);
    setDraftQuery(nextQuery);
    setSearchFeedback("");
    setFilterOpen(false);
    setSearchOpen(false);
    setExpandedCardId(null);
    setView("results");
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedCommodityId(getDefaultCommodityId(categoryId));
    setDraftQuery("");
    setQuery("");
    setSearchSelection(null);
    setExpandedCardId(null);
  };

  const handleSearchInput = (value) => {
    setDraftQuery(value);
    setSearchSelection(null);
    if (searchFeedback) {
      setSearchFeedback("");
    }
    setSearchOpen(true);
  };

  const toggleSelection = (value, selectedValues, setter) => {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  const clearFilters = () => {
    setSelectedMarkets([]);
    setSelectedVarieties([]);
    setDraftSelectedMarkets([]);
    setDraftSelectedVarieties([]);
  };

  const clearDraftFilters = () => {
    setDraftSelectedMarkets([]);
    setDraftSelectedVarieties([]);
  };

  const applyFilters = () => {
    setSelectedMarkets(draftSelectedMarkets);
    setSelectedVarieties(draftSelectedVarieties);
    setFilterOpen(false);
    setView("results");
  };

  const openSearch = (event) => {
    if (!searchOpen && event?.currentTarget instanceof HTMLButtonElement) {
      searchReturnFocusRef.current = event.currentTarget;
    }

    if (!searchOpen && view === "results") {
      setDraftQuery(query || selectedCommodityLabel);
    }

    setSearchFeedback("");
    setSearchOpen(true);
  };

  const openFilter = (event) => {
    if (event?.currentTarget instanceof HTMLButtonElement) {
      filterReturnFocusRef.current = event.currentTarget;
    }

    setDraftSelectedMarkets(selectedMarkets);
    setDraftSelectedVarieties(selectedVarieties);
    setFilterOpen(true);
  };

  return (
    <div className="site-shell">
      {!isOnline && (
        <div className="status-banner warning" role="status">
          {copy.offlineBanner}
        </div>
      )}

      {view === "home" ? (
        <HomePage
          categoryCommodities={categoryCommodities}
          copy={copy}
          language={language}
          onCategoryChange={handleCategoryChange}
          onCloseSearch={closeSearch}
          onCommoditySelect={(commodity) =>
            commitSearch(getLocalizedText(commodity.label, language), {
              kind: "Commodity",
              id: commodity.id,
            })
          }
          onLanguageChange={setLanguage}
          onQueryChange={handleSearchInput}
          onSearchOpen={openSearch}
          onSearchSubmit={commitSearch}
          onSuggestionSelect={(item) =>
            commitSearch(getLocalizedText(item.title, language), {
              kind: item.kind,
              id: item.id,
            })
          }
          searchDialogRef={searchDialogRef}
          searchFeedback={searchFeedback}
          searchOpen={searchOpen}
          searchSuggestionRows={searchSuggestionRows}
          searchValue={draftQuery}
          selectedCategoryId={selectedCategoryId}
        />
      ) : (
        <ResultsPage
          activeFilterCount={activeFilterCount}
          baseResultCount={queryMatchedResults.length}
          copy={copy}
          draftSelectedMarkets={draftSelectedMarkets}
          draftSelectedVarieties={draftSelectedVarieties}
          expandedCardId={expandedCardId}
          filterDialogRef={filterDialogRef}
          filterOpen={filterOpen}
          filteredResults={filteredResults}
          formatDateLabel={formatDateLabel}
          getFreshnessMeta={getFreshnessMeta}
          isOnline={isOnline}
          language={language}
          onApplyFilters={applyFilters}
          onBack={() => {
            setFilterOpen(false);
            setSearchOpen(false);
            setExpandedCardId(null);
            setView("home");
          }}
          onClearDraftFilters={clearDraftFilters}
          onClearFilters={clearFilters}
          onCloseFilter={closeFilter}
          onCloseSearch={closeSearch}
          onFilterOpen={openFilter}
          onGoHome={() => {
            setFilterOpen(false);
            setSearchOpen(false);
            setExpandedCardId(null);
            setView("home");
          }}
          onLanguageChange={setLanguage}
          onQueryChange={handleSearchInput}
          onRemoveAppliedMarket={(marketId) =>
            toggleSelection(marketId, selectedMarkets, setSelectedMarkets)
          }
          onRemoveAppliedVariety={(varietyId) =>
            toggleSelection(varietyId, selectedVarieties, setSelectedVarieties)
          }
          onRetrySearch={() =>
            commitSearch(query || draftQuery || selectedCommodityLabel)
          }
          onSearchAnyway={() => commitSearch(draftQuery)}
          onSearchOpen={openSearch}
          onSearchSubmit={commitSearch}
          onSuggestionSelect={(item) =>
            commitSearch(getLocalizedText(item.title, language), {
              kind: item.kind,
              id: item.id,
            })
          }
          onToggleCard={(cardId) =>
            setExpandedCardId((currentId) => (currentId === cardId ? null : cardId))
          }
          onToggleMarket={(marketId) =>
            toggleSelection(marketId, draftSelectedMarkets, setDraftSelectedMarkets)
          }
          onToggleVariety={(varietyId) =>
            toggleSelection(varietyId, draftSelectedVarieties, setDraftSelectedVarieties)
          }
          query={query}
          resultsHeading={resultsHeading}
          resultsState={resultsViewState}
          searchDialogRef={searchDialogRef}
          searchFeedback={searchFeedback}
          searchOpen={searchOpen}
          searchSuggestionRows={searchSuggestionRows}
          searchValue={draftQuery}
          selectedMarkets={selectedMarkets}
          selectedVarieties={selectedVarieties}
          showFilterSummary={showFilterSummary}
        />
      )}
    </div>
  );
}

function HomePage({
  categoryCommodities,
  copy,
  language,
  onCategoryChange,
  onCloseSearch,
  onCommoditySelect,
  onLanguageChange,
  onQueryChange,
  onSearchOpen,
  onSearchSubmit,
  onSuggestionSelect,
  searchDialogRef,
  searchFeedback,
  searchOpen,
  searchSuggestionRows,
  searchValue,
  selectedCategoryId,
}) {
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page home-page">
      <header className="topbar">
        <div className="topbar-inner topbar-home">
          <div className="topbar-left-slot">
            <LanguageToggle
              copy={copy}
              language={language}
              onChange={onLanguageChange}
            />
          </div>
          <div className="brand-inline">
            <img src={assets.logo} alt="" />
            <span>{copy.brand}</span>
          </div>
          <button
            aria-label={copy.search.openAria}
            className={`icon-button sticky-search-btn ${heroVisible ? "" : "visible"}`}
            onClick={onSearchOpen}
            type="button"
          >
            <img src={assets.search} alt="" />
          </button>
        </div>
      </header>

      <section className="hero-block" ref={heroRef}>
        <picture className="hero-bg-img">
          <source media="(min-width: 768px)" srcSet={assets.heroBg} />
          <img src={assets.heroBgMobile} alt="" />
        </picture>
        <div className={`hero-copy ${searchOpen ? "search-active" : ""}`}>
          <h1>
            {copy.home.heroTitleLine1}
            <br />
            {copy.home.heroTitleLine2}
          </h1>
          <SearchField
            copy={copy}
            mobilePlaceholder={copy.home.searchPlaceholderMobile}
            onChange={onQueryChange}
            onFocus={onSearchOpen}
            placeholder={copy.home.searchPlaceholder}
            value={searchValue}
          />
        </div>
      </section>

      <section className="category-section">
        <p className="section-copy">{copy.home.quickSelect}</p>
      </section>

      <div className={`category-tabs ${heroVisible ? "" : "is-stuck"}`}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${category.id === selectedCategoryId ? "active" : ""}`}
            onClick={() => onCategoryChange(category.id)}
            type="button"
          >
            <img src={assets.category} alt="" />
            <span>{getLocalizedText(category.label, language)}</span>
          </button>
        ))}
      </div>

      <section className="commodity-gallery">
        <div className="section-heading">
          <h2>
            {getLocalizedText(
              categories.find((category) => category.id === selectedCategoryId)?.label,
              language,
            )}{" "}
            ({copy.home.itemsLabel(categoryCommodities.length)})
          </h2>
        </div>
        <div className="commodity-grid">
          {categoryCommodities.map((commodity) => (
            <button
              key={commodity.id}
              className="commodity-tile"
              onClick={() => onCommoditySelect(commodity)}
              type="button"
            >
              <div className="thumb-wrap">
                <img
                  src={assets.commodityThumb}
                  alt={getLocalizedText(commodity.label, language)}
                />
              </div>
              <p>{getLocalizedText(commodity.label, language)}</p>
            </button>
          ))}
        </div>
      </section>

      {searchOpen && (
        <>
          <div className="screen-overlay" onClick={onCloseSearch} />
          <div
            aria-label={copy.search.dialogLabel}
            aria-modal="true"
            className="floating-search-panel home-search"
            ref={searchDialogRef}
            role="dialog"
            tabIndex="-1"
          >
            <SearchField
              autoFocus
              copy={copy}
              mobilePlaceholder={copy.home.searchPlaceholderMobile}
              onChange={onQueryChange}
              onClose={onCloseSearch}
              onFocus={onSearchOpen}
              onSubmit={onSearchSubmit}
              placeholder={copy.home.searchPlaceholder}
              value={searchValue}
            />
            <div className="search-meta-row">
              <p className="search-support-copy">{copy.home.searchSupport}</p>
              {searchFeedback && (
                <p aria-live="polite" className="search-feedback" role="status">
                  {searchFeedback}
                </p>
              )}
            </div>
            <SearchSuggestions
              copy={copy}
              items={searchSuggestionRows}
              language={language}
              onSearchAnyway={() => onSearchSubmit(searchValue)}
              onSelect={onSuggestionSelect}
              query={searchValue}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ResultsPage({
  activeFilterCount,
  baseResultCount,
  copy,
  draftSelectedMarkets,
  draftSelectedVarieties,
  expandedCardId,
  filterDialogRef,
  filterOpen,
  filteredResults,
  formatDateLabel,
  getFreshnessMeta,
  isOnline,
  language,
  onApplyFilters,
  onBack,
  onClearDraftFilters,
  onClearFilters,
  onCloseFilter,
  onCloseSearch,
  onFilterOpen,
  onGoHome,
  onLanguageChange,
  onQueryChange,
  onRemoveAppliedMarket,
  onRemoveAppliedVariety,
  onRetrySearch,
  onSearchAnyway,
  onSearchOpen,
  onSearchSubmit,
  onSuggestionSelect,
  onToggleCard,
  onToggleMarket,
  onToggleVariety,
  query,
  resultsHeading,
  resultsState,
  searchDialogRef,
  searchFeedback,
  searchOpen,
  searchSuggestionRows,
  searchValue,
  selectedMarkets,
  selectedVarieties,
  showFilterSummary,
}) {
  const [filterSummaryVisible, setFilterSummaryVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 0) {
        setFilterSummaryVisible(true);
      } else if (Math.abs(scrollDelta) >= 4) {
        setFilterSummaryVisible(scrollDelta < 0);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showFilterSummary) {
      setFilterSummaryVisible(true);
    }
  }, [showFilterSummary]);

  const countCopy =
    resultsState === "loading"
      ? copy.results.loading
      : copy.results.count(filteredResults.length);

  return (
    <div className="page results-page">
      <header className="topbar">
        <div className="topbar-inner results-topbar-inner">
          <button
            aria-label={copy.header.backAria}
            className="icon-button"
            onClick={onBack}
            type="button"
          >
            <img src={assets.back} alt="" />
          </button>
          <div
            aria-label={copy.header.goHomeAria}
            className="brand-inline brand-link"
            onClick={onBack}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onBack();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <img src={assets.logo} alt="" />
            <span>{copy.brand}</span>
          </div>
          <div className="topbar-actions">
            <LanguageToggle
              copy={copy}
              language={language}
              onChange={onLanguageChange}
            />
            <button
              aria-label={copy.search.openAria}
              className="icon-button"
              onClick={onSearchOpen}
              type="button"
            >
              <img src={assets.search} alt="" />
            </button>
          </div>
        </div>
      </header>

      <section className={`results-toolbar ${showFilterSummary ? "has-filter-summary" : ""}`}>
        <div className="results-toolbar-inner">
          <div className="commodity-title">
            <div className="thumb-wrap large">
              <img src={assets.commodityThumb} alt="" />
            </div>
            <div className="toolbar-support">
              <h2>{resultsHeading}</h2>
              <p className="results-count-copy">
                {countCopy}
                {activeFilterCount > 0 ? ` • ${copy.results.filtersApplied(activeFilterCount)}` : ""}
              </p>
            </div>
          </div>
          <button className="filter-button" onClick={onFilterOpen} type="button">
            <img src={assets.filter} alt="" />
            <span className="filter-button-label">{copy.buttons.filter}</span>
            {activeFilterCount > 0 && (
              <span className="filter-count">
                <span className="filter-count-value">{activeFilterCount}</span>
              </span>
            )}
          </button>
        </div>
      </section>

      {!isOnline && (
        <div className="results-meta-row" role="status">
          <span>{copy.offlineBanner}</span>
        </div>
      )}

      {showFilterSummary && (
        <section className={`filter-summary ${filterSummaryVisible ? "" : "is-hidden"}`}>
          <div className="filter-summary-inner">
            {selectedMarkets.length > 0 && (
              <div className="filter-summary-row market-filter-summary">
                <div className="filter-summary-label">
                  <img src={assets.suggestionMarket} alt="" />
                  <span>{copy.filters.marketSummary}</span>
                </div>
                <div className="chip-row wrap">
                  {selectedMarkets.map((marketId) => (
                    <RemovableFilterChip
                      key={marketId}
                      label={getLocalizedText(
                        marketOptions.find((item) => item.id === marketId)?.label,
                        language,
                      )}
                      onRemove={() => onRemoveAppliedMarket(marketId)}
                      tone="market"
                    />
                  ))}
                </div>
              </div>
            )}
            {selectedVarieties.length > 0 && (
              <div className="filter-summary-row variety-filter-summary">
                <div className="filter-summary-label">
                  <img src={assets.suggestionVariety} alt="" />
                  <span>{copy.filters.varietySummary}</span>
                </div>
                <div className="chip-row wrap">
                  {selectedVarieties.map((varietyId) => (
                    <RemovableFilterChip
                      key={varietyId}
                      label={getLocalizedText(
                        varietyOptions.find((item) => item.id === varietyId)?.label,
                        language,
                      )}
                      onRemove={() => onRemoveAppliedVariety(varietyId)}
                      tone="variety"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <main
        className={`results-content ${
          resultsState !== "ready" && resultsState !== "loading" ? "is-empty" : ""
        }`}
      >
        {resultsState === "loading" && <ResultsLoadingState />}

        {resultsState === "ready" &&
          filteredResults.map((card) => (
            <PriceCard
              card={card}
              copy={copy}
              expanded={expandedCardId === card.id}
              formatDateLabel={formatDateLabel}
              getFreshnessMeta={getFreshnessMeta}
              key={card.id}
              language={language}
              onToggle={() => onToggleCard(card.id)}
            />
          ))}

        {resultsState === "no-data" && (
          <ResultsStatePanel
            actionLabel={copy.buttons.goHome}
            body={copy.results.noDataBody}
            onAction={onGoHome}
            onSecondaryAction={onSearchOpen}
            secondaryActionLabel={copy.buttons.editSearch}
            title={copy.results.noDataTitle}
          />
        )}

        {resultsState === "filtered-out" && (
          <ResultsStatePanel
            actionLabel={copy.buttons.clearFilters}
            body={copy.results.filteredOutBody(baseResultCount)}
            onAction={onClearFilters}
            onSecondaryAction={onSearchOpen}
            secondaryActionLabel={copy.buttons.editSearch}
            title={copy.results.filteredOutTitle}
          />
        )}

        {resultsState === "error" && (
          <ResultsStatePanel
            actionLabel={copy.buttons.retry}
            body={copy.results.errorBody}
            onAction={onRetrySearch}
            onSecondaryAction={onGoHome}
            secondaryActionLabel={copy.buttons.goHome}
            title={copy.results.errorTitle}
          />
        )}
      </main>

      {searchOpen && (
        <>
          <div className="screen-overlay" onClick={onCloseSearch} />
          <div
            aria-label={copy.search.dialogLabel}
            aria-modal="true"
            className="floating-search-panel results-search"
            ref={searchDialogRef}
            role="dialog"
            tabIndex="-1"
          >
            <SearchField
              autoFocus
              copy={copy}
              mobilePlaceholder={copy.search.placeholderResultsMobile}
              onChange={onQueryChange}
              onClose={onCloseSearch}
              onFocus={onSearchOpen}
              onSubmit={onSearchSubmit}
              placeholder={copy.search.placeholderResults}
              value={searchValue}
            />
            <div className="search-meta-row">
              <p className="search-support-copy">{copy.home.searchSupport}</p>
              {searchFeedback && (
                <p aria-live="polite" className="search-feedback" role="status">
                  {searchFeedback}
                </p>
              )}
            </div>
            <SearchSuggestions
              copy={copy}
              items={searchSuggestionRows}
              language={language}
              onSearchAnyway={onSearchAnyway}
              onSelect={onSuggestionSelect}
              query={searchValue}
            />
          </div>
        </>
      )}

      {filterOpen && (
        <>
          <div className="screen-overlay" onClick={onCloseFilter} />
          <FilterDialog
            copy={copy}
            dialogRef={filterDialogRef}
            language={language}
            marketOptions={marketOptions}
            onApply={onApplyFilters}
            onClear={onClearDraftFilters}
            onClose={onCloseFilter}
            onToggleMarket={onToggleMarket}
            onToggleVariety={onToggleVariety}
            selectedCount={draftSelectedMarkets.length + draftSelectedVarieties.length}
            selectedMarkets={draftSelectedMarkets}
            selectedVarieties={draftSelectedVarieties}
            varietyOptions={varietyOptions}
          />
        </>
      )}
    </div>
  );
}

function SearchField({
  autoFocus = false,
  copy,
  mobilePlaceholder,
  onChange,
  onClose,
  onFocus,
  onSubmit,
  placeholder,
  value,
}) {
  const isMobileViewport = useIsMobileSearchViewport();
  const resolvedPlaceholder =
    isMobileViewport && mobilePlaceholder ? mobilePlaceholder : placeholder;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className="search-field" onSubmit={handleSubmit} role="search">
      {onSubmit ? (
        <button aria-label={copy.search.submitAria} className="search-submit" type="submit">
          <img className="search-icon" src={assets.search} alt="" />
        </button>
      ) : (
        <img className="search-icon" src={assets.search} alt="" />
      )}
      <input
        aria-label={resolvedPlaceholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={resolvedPlaceholder}
        type="search"
        value={value}
      />
      {onClose && (
        <button
          aria-label={copy.search.closeAria}
          className="search-close"
          onClick={onClose}
          type="button"
        >
          <img src={assets.close} alt="" />
        </button>
      )}
    </form>
  );
}

function SearchSuggestions({ copy, items, language, onSearchAnyway, onSelect, query }) {
  const suggestionIcons = {
    Commodity: assets.suggestionCommodity,
    Market: assets.suggestionMarket,
    Variety: assets.suggestionVariety,
  };

  if (items.length === 0) {
    return (
      <div className="search-empty-panel">
        <img className="empty-state-icon" src={assets.emptyState} alt="" aria-hidden="true" />
        <strong>{copy.search.noSuggestionsTitle}</strong>
        <p>{copy.search.noSuggestionsBody}</p>
        <button className="empty-state-button" onClick={onSearchAnyway} type="button">
          {copy.search.searchAnyway(query.trim())}
        </button>
      </div>
    );
  }

  return (
    <div className="search-suggestions">
      {items.map((item, index) => (
        <button
          className="suggestion-row"
          key={`${item.kind}-${index}`}
          onClick={() => onSelect(item)}
          type="button"
        >
          <div className={`thumb-wrap small suggestion-thumb-${item.kind.toLowerCase()}`}>
            <img
              src={item.kind === "Market" ? assets.marketThumb : assets.commodityThumb}
              alt=""
            />
          </div>
          <div className="suggestion-copy">
            <strong>{getLocalizedText(item.title, language)}</strong>
            <span className={`suggestion-kind ${item.accent}`}>
              <img src={suggestionIcons[item.kind]} alt="" />
              {copy.kinds[item.kind]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function PriceCard({
  card,
  copy,
  expanded,
  formatDateLabel,
  getFreshnessMeta,
  language,
  onToggle,
}) {
  const freshnessMeta = getFreshnessMeta(card.updatedAt, card.freshnessStatus);

  return (
    <article className={`price-card ${expanded ? "expanded" : ""}`}>
      <div className="card-header">
        <div className="card-market">
          <img src={assets.marketThumb} alt="" />
          <h3>{getLocalizedText(card.marketLabel, language)}</h3>
        </div>
      </div>

      <div className="card-status-row">
        <span className="card-source-label">
          {copy.cards.sourceLabel(getLocalizedText(card.sourceLabel, language))}
        </span>
        <StatusPill tone={freshnessMeta.tone}>{freshnessMeta.label}</StatusPill>
      </div>

      <div className="stats-row">
        {card.stats.map((stat) => (
          <div className="stat-block" key={`${card.id}-${stat.tone}-${stat.value}`}>
            <div className="stat-label">{getLocalizedText(stat.label, language)}</div>
            <div className={`stat-value ${stat.tone}`}>{stat.value}</div>
            <div className={`stat-delta ${stat.deltaTone}`}>
              <span>{`₹ ${stat.delta}`}</span>
              <span className="delta-icon">{stat.deltaTone === "up" ? "▲" : "▼"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="detail-grid">
        <MetaItem
          label={copy.cards.meta.variety}
          value={getLocalizedText(card.varietyId ? varietyOptions.find((item) => item.id === card.varietyId)?.label : "", language)}
        />
        <MetaItem label={copy.cards.meta.grade} value={getLocalizedText(card.grade, language)} />
        <MetaItem
          label={copy.cards.meta.arrival}
          subvalue={getLocalizedText(card.unit, language)}
          value={card.arrival}
        />
        <MetaItem label={copy.cards.meta.latestUpdate} value={formatDateLabel(card.updatedAt)} />
        <MetaItem
          label={copy.cards.meta.previousUpdate}
          value={formatDateLabel(card.previousUpdate)}
        />
      </div>

      {expanded && (
        <div className="graph-panel">
          {card.historyStatus === "ready" && (
            <>
              <div className="graph-title">{copy.cards.trendTitle}</div>
              <div className="graph-canvas">
                <img src={assets.graph} alt={copy.cards.trendTitle} />
              </div>
            </>
          )}
          {card.historyStatus === "unavailable" && (
            <div className="history-empty" role="status">
              <span
                className="history-empty-icon"
                alt=""
                aria-hidden="true"
                style={{ "--history-empty-icon": `url(${assets.emptyState})` }}
              />
              <strong>{copy.cards.historyUnavailableTitle}</strong>
              <p>{copy.cards.historyUnavailableBody}</p>
            </div>
          )}
          {card.historyStatus === "error" && (
            <div className="history-empty" role="status">
              <span
                className="history-empty-icon"
                alt=""
                aria-hidden="true"
                style={{ "--history-empty-icon": `url(${assets.emptyState})` }}
              />
              <strong>{copy.cards.historyErrorTitle}</strong>
              <p>{copy.cards.historyErrorBody}</p>
            </div>
          )}
        </div>
      )}

      <button className="history-cta" onClick={onToggle} type="button">
        <span>{copy.cards.viewHistory}</span>
        <span className="caret">{expanded ? "⌃" : "⌄"}</span>
      </button>
    </article>
  );
}

function StatusPill({ children, tone }) {
  return <span className={`status-pill status-pill-${tone}`}>{children}</span>;
}

function MetaItem({ label, subvalue, value }) {
  return (
    <div className="meta-item">
      <div className="meta-label">{label}</div>
      <div className="meta-value">
        {value}
        {subvalue && <span className="meta-subvalue"> {subvalue}</span>}
      </div>
    </div>
  );
}

function ResultsLoadingState() {
  return (
    <div aria-live="polite" className="results-loading-grid">
      {[1, 2, 3].map((item) => (
        <div className="skeleton-card" key={item}>
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-stats">
            <div className="skeleton-line skeleton-line-box" />
            <div className="skeleton-line skeleton-line-box" />
            <div className="skeleton-line skeleton-line-box" />
          </div>
          <div className="skeleton-meta">
            <div className="skeleton-line skeleton-line-meta" />
            <div className="skeleton-line skeleton-line-meta" />
            <div className="skeleton-line skeleton-line-meta" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsStatePanel({
  actionLabel,
  body,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  title,
}) {
  return (
    <section aria-live="polite" className="results-state-panel">
      <img className="empty-state-icon" src={assets.emptyState} alt="" aria-hidden="true" />
      <h3 className="state-title">{title}</h3>
      <p className="state-copy">{body}</p>
      <div className="state-actions">
        {onAction && (
          <button className="empty-state-button" onClick={onAction} type="button">
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && (
          <button
            className="empty-state-button secondary"
            onClick={onSecondaryAction}
            type="button"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </section>
  );
}

function FilterDialog({
  copy,
  dialogRef,
  language,
  marketOptions,
  onApply,
  onClear,
  onClose,
  onToggleMarket,
  onToggleVariety,
  selectedCount,
  selectedMarkets,
  selectedVarieties,
  varietyOptions,
}) {
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileSelectionGroup, setMobileSelectionGroup] = useState(null);
  const isMobileViewport = useIsMobileSearchViewport();

  const handleGroupToggle = (group) => {
    if (isMobileViewport) {
      setMobileSelectionGroup(group);
      return;
    }

    setOpenGroup((current) => (current === group ? null : group));
  };

  const handleBackToSheet = () => {
    setMobileSelectionGroup(null);
  };

  const marketSelectionOpen = mobileSelectionGroup === "market";
  const varietySelectionOpen = mobileSelectionGroup === "variety";
  const marketExpanded = marketSelectionOpen || openGroup === "market";
  const varietyExpanded = varietySelectionOpen || openGroup === "variety";

  return (
    <div
      aria-label={copy.buttons.filter}
      aria-modal="true"
      className="filter-dialog"
      ref={dialogRef}
      role="dialog"
      tabIndex="-1"
    >
      {mobileSelectionGroup ? (
        <MobileFilterSelectionView
          backAria={copy.header.backAria}
          copy={copy}
          doneLabel={copy.filters.done}
          helper={copy.filters.helper}
          language={language}
          onBack={handleBackToSheet}
          onDone={handleBackToSheet}
          onToggle={
            mobileSelectionGroup === "market" ? onToggleMarket : onToggleVariety
          }
          options={
            mobileSelectionGroup === "market" ? marketOptions : varietyOptions
          }
          selectedValues={
            mobileSelectionGroup === "market" ? selectedMarkets : selectedVarieties
          }
          title={
            mobileSelectionGroup === "market"
              ? copy.filters.marketFilterTitle
              : copy.filters.varietyFilterTitle
          }
        />
      ) : (
        <>
          <div className="dialog-header">
            <div>
              <h3>{copy.filters.title}</h3>
              <p className="filter-header-copy">
                {selectedCount > 0
                  ? copy.filters.readyCount(selectedCount)
                  : copy.filters.helper}
              </p>
            </div>
            <button
              aria-label={copy.search.closeAria}
              className="icon-button close"
              onClick={onClose}
              type="button"
            >
              <img src={assets.close} alt="" />
            </button>
          </div>

          <div className="filter-dialog-body">
            <PrototypeFilterGroup
              copy={copy}
              expanded={marketExpanded}
              isMobile={isMobileViewport}
              language={language}
              onToggle={onToggleMarket}
              onToggleExpanded={() => handleGroupToggle("market")}
              options={marketOptions}
              selectedValues={selectedMarkets}
              title={copy.filters.marketFilterTitle}
            />

            <PrototypeFilterGroup
              copy={copy}
              expanded={varietyExpanded}
              isMobile={isMobileViewport}
              language={language}
              onToggle={onToggleVariety}
              onToggleExpanded={() => handleGroupToggle("variety")}
              options={varietyOptions}
              selectedValues={selectedVarieties}
              title={copy.filters.varietyFilterTitle}
            />
          </div>

          <div className="filter-dialog-footer">
            <div className="action-row">
              <button className="action-button ghost" onClick={onClear} type="button">
                {copy.filters.clear}
              </button>
              <button className="action-button solid" onClick={onApply} type="button">
                {copy.filters.apply}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileFilterSelectionView({
  backAria,
  copy,
  doneLabel,
  helper,
  language,
  onBack,
  onDone,
  onToggle,
  options,
  selectedValues,
  title,
}) {
  const backButtonRef = useRef(null);

  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  return (
    <div className="filter-selection-view">
      <div className="filter-selection-header">
        <button
          aria-label={backAria}
          className="icon-button filter-selection-back"
          onClick={onBack}
          ref={backButtonRef}
          type="button"
        >
          <img src={assets.back} alt="" />
        </button>
        <div className="filter-selection-title">
          <h3>{title}</h3>
          <p className="filter-selection-count">
            {selectedValues.length > 0
              ? copy.filters.readyCount(selectedValues.length)
              : helper}
          </p>
        </div>
      </div>

      <div className="filter-selection-body" role="listbox">
        {options.length > 0 ? (
          options.map((option) => {
            const checked = selectedValues.includes(option.id);

            return (
              <button
                aria-selected={checked}
                className={`prototype-option-row filter-selection-row ${checked ? "selected" : ""}`}
                key={option.id}
                onClick={() => onToggle(option.id)}
                type="button"
              >
                <span className="prototype-option-label">
                  {getLocalizedText(option.label, language)}
                </span>
                <span aria-hidden="true" className="prototype-checkbox-box">
                  {checked && <span className="prototype-checkbox-check" />}
                </span>
              </button>
            );
          })
        ) : (
          <div className="prototype-filter-empty" role="status">
            {copy.filters.optionsUnavailable}
          </div>
        )}
      </div>

      <div className="filter-selection-footer">
        <button className="action-button solid" onClick={onDone} type="button">
          {doneLabel}
        </button>
      </div>
    </div>
  );
}

function PrototypeFilterGroup({
  copy,
  expanded,
  isMobile,
  language,
  onToggle,
  onToggleExpanded,
  options,
  selectedValues,
  title,
}) {
  const groupRef = useRef(null);

  useEffect(() => {
    if (!expanded || !groupRef.current || isMobile) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      groupRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [expanded, isMobile]);

  return (
    <div
      className={`prototype-filter-group ${expanded ? "is-expanded" : ""}`}
      ref={groupRef}
    >
      <div className="filter-line">
        <span>{title}</span>
        <div className="line" />
      </div>

      {selectedValues.length > 0 && (
        <div className="chip-row wrap filter-chip-row">
          {selectedValues.map((itemId) => (
            <RemovableFilterChip
              key={itemId}
              label={getLocalizedText(
                options.find((option) => option.id === itemId)?.label,
                language,
              )}
              onRemove={() => onToggle(itemId)}
            />
          ))}
        </div>
      )}

      <div className="prototype-filter-select">
        <button
          aria-expanded={expanded}
          aria-haspopup={isMobile ? "dialog" : undefined}
          className="prototype-filter-trigger"
          onClick={onToggleExpanded}
          type="button"
        >
          <span className="prototype-filter-trigger-label">
            {copy.filters.tapToSelect}
          </span>
          <span className={`filter-chevron ${expanded ? "expanded" : ""}`} />
        </button>

        {!isMobile && expanded && options.length > 0 && (
          <div className="prototype-option-list" role="listbox">
            {options.map((option) => {
              const checked = selectedValues.includes(option.id);

              return (
                <button
                  aria-selected={checked}
                  className={`prototype-option-row ${checked ? "selected" : ""}`}
                  key={option.id}
                  onClick={() => onToggle(option.id)}
                  type="button"
                >
                  <span className="prototype-option-label">
                    {getLocalizedText(option.label, language)}
                  </span>
                  <span aria-hidden="true" className="prototype-checkbox-box">
                    {checked && <span className="prototype-checkbox-check" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!isMobile && expanded && options.length === 0 && (
          <div className="prototype-filter-empty" role="status">
            {copy.filters.optionsUnavailable}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  copy,
  expanded,
  language,
  onToggle,
  onToggleExpanded,
  options,
  selectedValues,
  title,
}) {
  const groupRef = useRef(null);

  useEffect(() => {
    if (!expanded || !groupRef.current) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      groupRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [expanded]);

  return (
    <div className={`filter-group ${expanded ? "is-expanded" : ""}`} ref={groupRef}>
      <div className="filter-line">
        <span>{title}</span>
        <div className="line" />
      </div>

      {selectedValues.length > 0 && (
        <div className="chip-row wrap filter-chip-row">
          {selectedValues.map((itemId) => (
            <RemovableFilterChip
              key={itemId}
              label={getLocalizedText(
                options.find((option) => option.id === itemId)?.label,
                language,
              )}
              onRemove={() => onToggle(itemId)}
            />
          ))}
        </div>
      )}

      <button
        aria-expanded={expanded}
        className="filter-trigger"
        onClick={onToggleExpanded}
        type="button"
      >
        <span>{copy.filters.tapToSelect}</span>
        <span className={`filter-chevron ${expanded ? "expanded" : ""}`} />
      </button>

      {expanded && options.length > 0 && (
        <div className="option-list">
          {options.map((option) => {
            const checked = selectedValues.includes(option.id);
            return (
              <button
                className={`option-row ${checked ? "selected" : ""}`}
                key={option.id}
                onClick={() => onToggle(option.id)}
                type="button"
              >
                <span>{getLocalizedText(option.label, language)}</span>
                <span className="checkbox-box">
                  {checked && <span className="checkbox-check">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {expanded && options.length === 0 && (
        <div className="filter-empty" role="status">
          {copy.filters.optionsUnavailable}
        </div>
      )}
    </div>
  );
}

function RemovableFilterChip({ label, onRemove, tone }) {
  return (
    <button
      aria-label={label}
      className={`filter-chip ${tone ? `filter-chip-${tone}` : ""}`}
      onClick={onRemove}
      type="button"
    >
      <span>{label}</span>
      <span aria-hidden="true" className="chip-close">
        ×
      </span>
    </button>
  );
}

function LanguageToggle({ copy, language, onChange }) {
  return (
    <div aria-label={copy.languageToggleLabel} className="language-toggle" role="group">
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.id}
          aria-pressed={language === option.id}
          className={`language-option ${language === option.id ? "active" : ""}`}
          onClick={() => onChange(option.id)}
          type="button"
        >
          <span>{option.shortLabel}</span>
          <span className="language-option-full">
            {copy.languageNames[option.id]}
          </span>
        </button>
      ))}
    </div>
  );
}

export default App;
