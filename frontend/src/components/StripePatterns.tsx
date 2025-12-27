/**
 * Global stripe patterns for SET game cards
 * 
 * These patterns are defined globally and referenced by all Card components
 * to avoid duplication and improve performance. Pattern IDs:
 * - stripes-c0: Red (#CC0000)
 * - stripes-c1: Green (#00AA00)
 * - stripes-c2: Purple (#6600CC)
 * 
 * These patterns are used for the "striped" shading variant of cards.
 */
export const StripePatterns = () => (
    <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
            {/* Red stripes - c0 */}
            <pattern
                id="stripes-c0"
                x="0"
                width="12"
                height="8"
                patternUnits="userSpaceOnUse"
                stroke="#CC0000"
                strokeWidth="0.3"
            >
                <line x1="1" y1="0" x2="1" y2="8" />
                <line x1="2.2" y1="0" x2="2.2" y2="8" />
                <line x1="3.5" y1="0" x2="3.5" y2="8" />
                <line x1="4.8" y1="0" x2="4.8" y2="8" />
                <line x1="6" y1="0" x2="6" y2="8" />
                <line x1="11" y1="0" x2="11" y2="8" />
                <line x1="8.5" y1="0" x2="8.5" y2="8" />
                <line x1="7.2" y1="0" x2="7.2" y2="8" />
                <line x1="9.8" y1="0" x2="9.8" y2="8" />
            </pattern>

            {/* Green stripes - c1 */}
            <pattern
                id="stripes-c1"
                x="0"
                width="12"
                height="8"
                patternUnits="userSpaceOnUse"
                stroke="#00AA00"
                strokeWidth="0.3"
            >
                <line x1="1" y1="0" x2="1" y2="8" />
                <line x1="2.2" y1="0" x2="2.2" y2="8" />
                <line x1="3.5" y1="0" x2="3.5" y2="8" />
                <line x1="4.8" y1="0" x2="4.8" y2="8" />
                <line x1="6" y1="0" x2="6" y2="8" />
                <line x1="11" y1="0" x2="11" y2="8" />
                <line x1="8.5" y1="0" x2="8.5" y2="8" />
                <line x1="7.2" y1="0" x2="7.2" y2="8" />
                <line x1="9.8" y1="0" x2="9.8" y2="8" />
            </pattern>

            {/* Purple stripes - c2 */}
            <pattern
                id="stripes-c2"
                x="0"
                width="12"
                height="8"
                patternUnits="userSpaceOnUse"
                stroke="#6600CC"
                strokeWidth="0.3"
            >
                <line x1="1" y1="0" x2="1" y2="8" />
                <line x1="2.2" y1="0" x2="2.2" y2="8" />
                <line x1="3.5" y1="0" x2="3.5" y2="8" />
                <line x1="4.8" y1="0" x2="4.8" y2="8" />
                <line x1="6" y1="0" x2="6" y2="8" />
                <line x1="11" y1="0" x2="11" y2="8" />
                <line x1="8.5" y1="0" x2="8.5" y2="8" />
                <line x1="7.2" y1="0" x2="7.2" y2="8" />
                <line x1="9.8" y1="0" x2="9.8" y2="8" />
            </pattern>
        </defs>
    </svg>
);