export const DEFAULT_LANGUAGE = "kn";
export const LANGUAGE_STORAGE_KEY = "namma-krishi-language";

export const LANGUAGE_OPTIONS = [
  { id: "en", shortLabel: "EN", fullLabel: "English" },
  { id: "kn", shortLabel: "ಕ", fullLabel: "ಕನ್ನಡ" },
];

const localeConfig = {
  en: {
    browserTitle: "Namma Krishi Prices",
    brand: "Namma Krishi Prices",
    languageToggleLabel: "Change language",
    languageNames: {
      en: "English",
      kn: "Kannada",
    },
    header: {
      backAria: "Back",
      goHomeAria: "Go to home page",
    },
    home: {
      heroTitleLine1: "Search commodities, markets, or",
      heroTitleLine2: "varieties",
      searchPlaceholder: "Try Tomato, Mysuru, or local",
      searchPlaceholderMobile: "Tomato, Mysuru...",
      searchSupport: "For example: Tomato, Mysuru, Kashmiri",
      quickSelect: "Choose your commodity quickly below.",
      itemsLabel: (count) => `${count} Items`,
    },
    search: {
      dialogLabel: "Search",
      openAria: "Open search",
      closeAria: "Close search",
      submitAria: "Search",
      placeholderResults: "Search commodity, market, or variety",
      placeholderResultsMobile: "Commodity, market...",
      blankFeedback: "Enter a commodity, market, or variety.",
      noSuggestionsTitle: "No matching suggestions",
      noSuggestionsBody:
        "You can still search by commodity, market, or variety name.",
      searchAnyway: (query) => `Search "${query}"`,
    },
    results: {
      loading: "Refreshing prices...",
      count: (count) => `${count} results`,
      filtersApplied: (count) => `${count} filters`,
      noDataTitle: "No data found for this search",
      noDataBody:
        "No price records matched this search. Try another commodity, market, or variety.",
      filteredOutTitle: "No results for these filters",
      filteredOutBody: (baseCount) =>
        `There are ${baseCount} results for this search, but the selected filters remove all of them.`,
      errorTitle: "Something went wrong",
      errorBody: "Prices could not be loaded right now.",
    },
    buttons: {
      goHome: "Go to home",
      editSearch: "Edit search",
      clearFilters: "Clear filters",
      retry: "Try again",
      filter: "Filter",
      applyFilters: "Apply filters",
    },
    offlineBanner:
      "No internet connection. Showing saved demo price data.",
    filters: {
      marketSummary: "Market:",
      varietySummary: "Variety:",
      title: "Filter results",
      helper: "Narrow results by market and variety",
      readyCount: (count) => `${count} selections ready`,
      marketFilterTitle: "Market filter",
      varietyFilterTitle: "Variety filter",
      tapToSelect: "Tap to choose",
      optionsUnavailable: "Options are not available right now.",
      clear: "Clear filters",
      done: "Done",
      apply: "Apply filters",
    },
    kinds: {
      Commodity: "Commodity",
      Market: "Market",
      Variety: "Variety",
    },
    cards: {
      freshness: {
        fresh: "Recently updated",
        aging: "Updated this week",
        stale: "Older data",
        muted: "Date unavailable",
      },
      historyLimited: "History data is limited",
      meta: {
        variety: "Variety",
        grade: "Grade",
        arrival: "Arrivals & units",
        latestUpdate: "Latest update",
        previousUpdate: "Previous update",
      },
      sourceLabel: (source) => `Source: ${source}`,
      openSource: "Open source",
      trendTitle: "Price trend",
      historyUnavailableTitle: "History data unavailable",
      historyUnavailableBody:
        "This market does not have a recent trend graph yet.",
      historyErrorTitle: "History data is temporarily unavailable",
      historyErrorBody:
        "The graph could not be loaded. Please check again later.",
      viewHistory: "View price history",
      dataUnavailable: "Information unavailable",
      updatedUnavailable: "Update information unavailable",
      updatedToday: "Updated today",
      updatedYesterday: "Updated yesterday",
      updatedDaysAgo: (days) => `Updated ${days} days ago`,
    },
  },
  kn: {
    browserTitle: "ನಮ್ಮ ಕೃಷಿ ಬೆಲೆಗಳು",
    brand: "ನಮ್ಮ ಕೃಷಿ ಬೆಲೆಗಳು",
    languageToggleLabel: "ಭಾಷೆ ಬದಲಿಸಿ",
    languageNames: {
      en: "English",
      kn: "ಕನ್ನಡ",
    },
    header: {
      backAria: "ಹಿಂದೆ",
      goHomeAria: "ಮನೆ ಪುಟಕ್ಕೆ ಹೋಗಿ",
    },
    home: {
      heroTitleLine1: "ಸರಕುಗಳು, ಮಾರುಕಟ್ಟೆಗಳು ಅಥವಾ",
      heroTitleLine2: "ತಳಿಗಳನ್ನು ಹುಡುಕಿ",
      searchPlaceholder: "ಟೊಮೇಟೊ, ಮೈಸೂರು, ಅಥವಾ ಸ್ಥಳೀಯ ಎಂದು ಪ್ರಯತ್ನಿಸಿ",
      searchPlaceholderMobile: "ಟೊಮೇಟೊ, ಮೈಸೂರು...",
      searchSupport: "ಉದಾ: ಟೊಮೇಟೊ, ಮೈಸೂರು, ಕಾಶ್ಮೀರಿ",
      quickSelect: "ನಿಮ್ಮ ಸರಕನ್ನು ಕೆಳಗೆ ತ್ವರಿತವಾಗಿ ಆಯ್ಕೆ ಮಾಡಿ.",
      itemsLabel: (count) => `${count} ವಸ್ತುಗಳು`,
    },
    search: {
      dialogLabel: "ಹುಡುಕಾಟ",
      openAria: "ಹುಡುಕಾಟ ತೆರೆಯಿರಿ",
      closeAria: "ಹುಡುಕಾಟ ಮುಚ್ಚಿ",
      submitAria: "ಹುಡುಕಿ",
      placeholderResults: "ಸರಕು, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತಳಿಯನ್ನು ಹುಡುಕಿ",
      placeholderResultsMobile: "ಸರಕು, ಮಾರುಕಟ್ಟೆ...",
      blankFeedback: "ಸರಕು, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತಳಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
      noSuggestionsTitle: "ಹೊಂದುವ ಸೂಚನೆಗಳು ಸಿಗಲಿಲ್ಲ",
      noSuggestionsBody:
        "ಸರಕು, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತಳಿಯ ಹೆಸರನ್ನು ಬರೆದು ಹುಡುಕಬಹುದು.",
      searchAnyway: (query) => `"${query}" ಹುಡುಕಿ`,
    },
    results: {
      loading: "ಬೆಲೆಗಳನ್ನು ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
      count: (count) => `${count} ಫಲಿತಾಂಶಗಳು`,
      filtersApplied: (count) => `${count} ಫಿಲ್ಟರ್‌ಗಳು`,
      noDataTitle: "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಡೇಟಾ ಸಿಗಲಿಲ್ಲ",
      noDataBody:
        "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಬೆಲೆ ದಾಖಲೆಗಳು ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಸರಕು, ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತಳಿಯನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
      filteredOutTitle: "ಈ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಫಲಿತಾಂಶಗಳಿಲ್ಲ",
      filteredOutBody: (baseCount) =>
        `ಹುಡುಕಾಟಕ್ಕೆ ${baseCount} ಫಲಿತಾಂಶಗಳಿವೆ, ಆದರೆ ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳು ಎಲ್ಲವನ್ನೂ ತೆಗೆದುಹಾಕಿವೆ.`,
      errorTitle: "ದೋಷ ಸಂಭವಿಸಿದೆ",
      errorBody: "ಬೆಲೆ ಮಾಹಿತಿಯನ್ನು ಈಗ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    },
    buttons: {
      goHome: "ಮನೆ ಪುಟಕ್ಕೆ ಹೋಗಿ",
      editSearch: "ಹುಡುಕಾಟ ಬದಲಿಸಿ",
      clearFilters: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
      retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      filter: "ಫಿಲ್ಟರ್",
      applyFilters: "ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಿ",
    },
    offlineBanner:
      "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಇಲ್ಲ. ಉಳಿಸಿದ ಡೆಮೊ ಬೆಲೆ ಮಾಹಿತಿಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
    filters: {
      marketSummary: "ಮಾರುಕಟ್ಟೆ :",
      varietySummary: "ತಳಿ :",
      title: "ಫಿಲ್ಟರ್ ಫಲಿತಾಂಶಗಳು",
      helper: "ಮಾರುಕಟ್ಟೆ ಮತ್ತು ತಳಿಯ ಪ್ರಕಾರ ಫಲಿತಾಂಶಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ",
      readyCount: (count) => `${count} ಆಯ್ಕೆಗಳು ಸಿದ್ಧವಾಗಿವೆ`,
      marketFilterTitle: "ಮಾರುಕಟ್ಟೆ ಫಿಲ್ಟರ್",
      varietyFilterTitle: "ತಳಿ ಫಿಲ್ಟರ್",
      tapToSelect: "ಆಯ್ಕೆ ಮಾಡಲು ಒತ್ತಿರಿ",
      optionsUnavailable: "ಆಯ್ಕೆಗಳು ಈಗ ಲಭ್ಯವಿಲ್ಲ.",
      clear: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
      done: "ಮುಗಿದಿದೆ",
      apply: "ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಿ",
    },
    kinds: {
      Commodity: "ಸರಕು",
      Market: "ಮಾರುಕಟ್ಟೆ",
      Variety: "ತಳಿ",
    },
    cards: {
      freshness: {
        fresh: "ಇತ್ತೀಚಿನ ನವೀಕರಣ",
        aging: "ಈ ವಾರದ ಡೇಟಾ",
        stale: "ಹಳೆಯ ಡೇಟಾ",
        muted: "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ",
      },
      historyLimited: "ಇತಿಹಾಸ ಡೇಟಾ ಸೀಮಿತವಾಗಿದೆ",
      meta: {
        variety: "ತಳಿ",
        grade: "ದರ್ಜೆ",
        arrival: "ಆವಕ ಮತ್ತು ಘಟಕಗಳು",
        latestUpdate: "ಇತ್ತೀಚಿನ ನವೀಕರಣ",
        previousUpdate: "ಹಿಂದಿನ ನವೀಕರಣ",
      },
      sourceLabel: (source) => `ಮೂಲ: ${source}`,
      openSource: "ಮೂಲ ತೆರೆ",
      trendTitle: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ",
      historyUnavailableTitle: "ಇತಿಹಾಸ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ",
      historyUnavailableBody:
        "ಈ ಮಾರುಕಟ್ಟೆಗೆ ಕಳೆದ ದಿನಗಳ ಗ್ರಾಫ್ ಇನ್ನೂ ಸೇರಿಸಲಾಗಿಲ್ಲ.",
      historyErrorTitle: "ಇತಿಹಾಸ ಡೇಟಾ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ",
      historyErrorBody:
        "ಗ್ರಾಫ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.",
      viewHistory: "ಬೆಲೆ ಇತಿಹಾಸವನ್ನು ನೋಡಿ",
      dataUnavailable: "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
      updatedUnavailable: "ನವೀಕರಣ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
      updatedToday: "ಇಂದು ನವೀಕರಿಸಲಾಗಿದೆ",
      updatedYesterday: "ನಿನ್ನೆ ನವೀಕರಿಸಲಾಗಿದೆ",
      updatedDaysAgo: (days) => `${days} ದಿನಗಳ ಹಿಂದೆ ನವೀಕರಿಸಲಾಗಿದೆ`,
    },
  },
};

export function getLocaleConfig(language) {
  return localeConfig[language] ?? localeConfig[DEFAULT_LANGUAGE];
}

export function getLocalizedText(value, language = DEFAULT_LANGUAGE) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return (
    value[language] ??
    value[DEFAULT_LANGUAGE] ??
    Object.values(value).find(Boolean) ??
    ""
  );
}
