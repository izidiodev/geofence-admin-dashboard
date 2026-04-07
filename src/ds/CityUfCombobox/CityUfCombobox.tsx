import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { flushSync } from "react-dom";
import { Box, Input, Spinner, Text } from "@chakra-ui/react";
import {
  filterMunicipios,
  formatCityUfDisplay,
  isIbgePairInList,
  labelsSet,
  loadIbgeMunicipios,
  parseCityUfFromLabel,
  type MunicipioOption,
} from "@/modules/geo/ibgeMunicipiosApi";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";

export interface CityUfValue {
  city: string;
  uf: string;
}

export interface CityUfComboboxProps {
  id: string;
  city: string;
  uf: string;
  onChange: (next: CityUfValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  allowUnlisted?: CityUfValue | null;
  placeholder?: string;
}

export function CityUfCombobox({
  id,
  city,
  uf,
  onChange,
  onBlur,
  disabled,
  allowUnlisted,
  placeholder,
}: CityUfComboboxProps): React.ReactNode {
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipValueSyncRef = useRef(false);

  const displayFromProps = formatCityUfDisplay(city, uf);
  const displayTextRef = useRef(displayFromProps);
  const committedCityRef = useRef(city);
  const committedUfRef = useRef(uf);

  const [displayText, setDisplayText] = useState(displayFromProps);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [all, setAll] = useState<MunicipioOption[]>([]);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (skipValueSyncRef.current) return;
    const next = formatCityUfDisplay(city, uf);
    setDisplayText(next);
    displayTextRef.current = next;
    committedCityRef.current = city;
    committedUfRef.current = uf;
  }, [city, uf]);

  useEffect(() => {
    displayTextRef.current = displayText;
  }, [displayText]);

  const allowedLabelSet = useMemo(() => {
    if (all.length === 0) return null;
    return labelsSet(all);
  }, [all]);

  const filtered = useMemo(() => filterMunicipios(all, displayText, 50), [all, displayText]);

  const showDropdown =
    open && !loadError && all.length > 0 && !loading && (filtered.length > 0 || displayText.trim() !== "");

  const ensureLoaded = useCallback(async () => {
    if (all.length > 0) return;
    setLoading(true);
    setLoadError(null);
    try {
      const list = await loadIbgeMunicipios();
      setAll(list);
    } catch {
      setLoadError(CAMPAIGN_MESSAGES.ibgeLoadError);
    } finally {
      setLoading(false);
    }
  }, [all.length]);

  useEffect(() => {
    if (!open) return;
    void ensureLoaded();
  }, [open, ensureLoaded]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent): void => {
      const t = e.target as Node | null;
      if (t == null) return;
      if (wrapRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, false);
    return () => document.removeEventListener("mousedown", onDoc, false);
  }, [open]);

  const commitSelection = useCallback(
    (nextCity: string, nextUf: string): void => {
      const c = nextCity.trim();
      const u = nextUf.trim().toUpperCase();
      const label = formatCityUfDisplay(c, u);
      displayTextRef.current = label;
      committedCityRef.current = c;
      committedUfRef.current = u;
      skipValueSyncRef.current = true;
      flushSync(() => {
        onChange({ city: c, uf: u });
      });
      setDisplayText(label);
      setHighlight(0);
      setOpen(false);
      queueMicrotask(() => {
        skipValueSyncRef.current = false;
      });
    },
    [onChange]
  );

  const revertDisplayToCommitted = useCallback((): void => {
    const t = formatCityUfDisplay(committedCityRef.current, committedUfRef.current);
    setDisplayText(t);
    displayTextRef.current = t;
  }, []);

  const handleBlur = useCallback((): void => {
    window.setTimeout(() => {
      const trimmed = displayTextRef.current.trim();
      const cc = committedCityRef.current;
      const cu = committedUfRef.current;

      if (trimmed === "") {
        if (cc !== "" || cu !== "") {
          skipValueSyncRef.current = true;
          flushSync(() => onChange({ city: "", uf: "" }));
          queueMicrotask(() => {
            skipValueSyncRef.current = false;
          });
        }
        setOpen(false);
        onBlur?.();
        return;
      }

      if (allowedLabelSet != null && allowedLabelSet.has(trimmed)) {
        const opt = all.find((m) => m.label === trimmed);
        if (opt) {
          commitSelection(opt.nome, opt.sigla);
          onBlur?.();
          return;
        }
      }

      const parsed = parseCityUfFromLabel(trimmed);
      if (parsed != null && all.length > 0 && isIbgePairInList(all, parsed.city, parsed.uf)) {
        commitSelection(parsed.city, parsed.uf);
        onBlur?.();
        return;
      }

      const au = allowUnlisted;
      if (au != null) {
        const ac = au.city.trim();
        const auu = au.uf.trim().toUpperCase();
        if (ac !== "" && auu !== "" && trimmed === formatCityUfDisplay(ac, auu)) {
          commitSelection(ac, auu);
          onBlur?.();
          return;
        }
      }

      revertDisplayToCommitted();
      setOpen(false);
      onBlur?.();
    }, 120);
  }, [all, allowedLabelSet, allowUnlisted, commitSelection, onBlur, onChange, revertDisplayToCommitted]);

  const handleSelectOption = useCallback(
    (opt: MunicipioOption): void => {
      commitSelection(opt.nome, opt.sigla);
    },
    [commitSelection]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (!open || filtered.length === 0) {
        if (e.key === "ArrowDown") {
          void ensureLoaded();
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[highlight];
        if (opt) handleSelectOption(opt);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        revertDisplayToCommitted();
      }
    },
    [open, filtered, highlight, handleSelectOption, ensureLoaded, revertDisplayToCommitted]
  );

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered.length, highlight]);

  const listboxId = `${id}-listbox`;

  return (
    <Box ref={wrapRef} position="relative" width="100%" zIndex={open ? 1 : 0}>
      <Input
        id={id}
        size="sm"
        value={displayText}
        disabled={disabled}
        placeholder={placeholder ?? CAMPAIGN_MESSAGES.locationSearchPlaceholder}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        autoComplete="off"
        onChange={(e) => {
          const v = e.target.value;
          displayTextRef.current = v;
          setDisplayText(v);
          setOpen(true);
          setHighlight(0);
          if (v.trim() === "") {
            skipValueSyncRef.current = true;
            flushSync(() => onChange({ city: "", uf: "" }));
            queueMicrotask(() => {
              skipValueSyncRef.current = false;
            });
          }
        }}
        onFocus={() => {
          void ensureLoaded();
          setOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
      />
      {loading ? (
        <Box position="absolute" right={2} top="50%" transform="translateY(-50%)" pointerEvents="none">
          <Spinner size="xs" />
        </Box>
      ) : null}
      {loadError ? (
        <Text fontSize="xs" color="red.500" mt={1}>
          {loadError}
        </Text>
      ) : null}

      {showDropdown ? (
        <Box
          id={listboxId}
          role="listbox"
          position="absolute"
          left={0}
          right={0}
          top="100%"
          mt={1}
          maxH="220px"
          overflowY="auto"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          zIndex={5000}
        >
          {filtered.length === 0 ? (
            <Text px={3} py={2} fontSize="sm" color="gray.600">
              {CAMPAIGN_MESSAGES.ibgeNoResults}
            </Text>
          ) : (
            filtered.map((opt, i) => (
              <Box
                key={opt.id}
                role="option"
                aria-selected={i === highlight}
                display="block"
                width="100%"
                textAlign="left"
                px={3}
                py={2}
                cursor="pointer"
                bg={i === highlight ? "gray.100" : "transparent"}
                _hover={{ bg: "gray.100" }}
                onMouseEnter={() => setHighlight(i)}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  handleSelectOption(opt);
                }}
              >
                {opt.label}
              </Box>
            ))
          )}
        </Box>
      ) : null}
    </Box>
  );
}
