# Carfax PDF Parsing Approach Analysis

## Requirements
- Extract: date, mileage, description, location, cost
- Preserve fidelity - no data loss
- Handle structured layouts (tables)
- Classify event types

## Option 1: Text Extraction (pdf-parse)

**How it works:**
- Extracts text directly from PDF
- Converts PDF to plain text
- Sends text to Claude for structuring

**Pros:**
- ✅ Fast
- ✅ Cheap (text tokens are cheaper than images)
- ✅ Works well for simple text-based PDFs
- ✅ No image conversion needed

**Cons:**
- ❌ **Loses table structure** - Tables become messy text
- ❌ **Column alignment lost** - Can't tell which text is in which column
- ❌ **Layout information lost** - Can't see visual structure
- ❌ **Harder to extract structured data** - Date/mileage/description might get jumbled
- ❌ **Fails on scanned PDFs** - No OCR capability

**Example of what text extraction might produce:**
```
06/15/2023 45,000 Oil change, Filter replacement Honda of Los Angeles $89.95
03/20/2022 32,000 Accident reported - Front impact Los Angeles, CA
```

**Problem:** Hard to reliably parse which part is date, mileage, description, location, cost when columns aren't preserved.

---

## Option 2: Vision API (PDF → Images)

**How it works:**
- Convert PDF pages to images (PNG)
- Send images to Claude Vision API
- Claude "sees" the PDF layout

**Pros:**
- ✅ **Preserves table structure** - Can see columns clearly
- ✅ **Understands layout** - Knows which text is in which column
- ✅ **Better field extraction** - Can reliably match date/mileage/description/location
- ✅ **Handles complex layouts** - Tables, multi-column, etc.
- ✅ **Works on scanned PDFs** - Vision can read images
- ✅ **Higher accuracy** - Better at understanding context

**Cons:**
- ❌ More expensive (image tokens cost more)
- ❌ Slower (image conversion + larger payloads)
- ❌ Larger API payloads

**Example of what vision sees:**
```
┌────────────┬─────────┬──────────────────────────────┬─────────────────────┬────────┐
│ Date       │ Mileage │ Description                  │ Location            │ Cost  │
├────────────┼─────────┼──────────────────────────────┼─────────────────────┼────────┤
│ 06/15/2023 │ 45,000  │ Oil change, Filter replace   │ Honda of LA         │ $89.95│
│ 03/20/2022 │ 32,000  │ Accident - Front impact      │ Los Angeles, CA     │       │
└────────────┴─────────┴──────────────────────────────┴─────────────────────┴────────┘
```

**Benefit:** Claude can clearly see which column is which, making extraction reliable.

---

## Option 3: Hybrid Approach

**How it works:**
- Try text extraction first
- Check quality (e.g., can we parse structured fields?)
- Fall back to vision if text extraction is poor

**Pros:**
- ✅ Cost-effective for simple PDFs
- ✅ High quality for complex PDFs
- ✅ Best of both worlds

**Cons:**
- ❌ More complex implementation
- ❌ Need quality detection logic
- ❌ Two code paths to maintain

---

## Recommendation: **Vision API (Option 2)**

### Why Vision is Best for Carfax:

1. **Carfax reports are tabular**
   - History events are in tables with columns
   - Text extraction loses column alignment
   - Vision preserves structure

2. **Field extraction accuracy**
   - Need to extract: date | mileage | description | location | cost
   - Vision can see which column is which
   - Text extraction makes this ambiguous

3. **Layout variations**
   - Carfax PDFs may have different layouts
   - Vision adapts better to layout changes
   - Text extraction is brittle to format changes

4. **You're okay with cost**
   - You said you're fine paying for higher API costs
   - Vision gives better results

### Cost Comparison (rough estimates):

**Text Extraction:**
- PDF → Text: ~$0.001 per page
- Claude text processing: ~$0.003 per 1K tokens
- **Total: ~$0.01-0.05 per Carfax report**

**Vision API:**
- PDF → Images: ~$0.001 per page
- Claude vision processing: ~$0.008 per image (Claude 3.5 Sonnet)
- **Total: ~$0.05-0.20 per Carfax report** (typically 2-5 pages)

**Difference:** Vision costs ~5-10x more, but gives much better accuracy for structured data.

---

## Alternative: Structured PDF Parsing

There's a third option we haven't discussed:

**Option 4: PDF Table Extraction Libraries**
- Use libraries like `pdf-table-extract`, `tabula-py`, `camelot`
- Extract tables directly from PDF structure
- Then send structured table data to Claude

**Pros:**
- ✅ Preserves table structure
- ✅ Cheaper than vision (text-based)
- ✅ Fast

**Cons:**
- ❌ Only works if PDF has proper table structure
- ❌ Fails on complex layouts
- ❌ May miss non-tabular events
- ❌ Requires additional library

**Verdict:** Could work, but Carfax PDFs may not always have clean table structures, and some events might not be in tables.

---

## Final Recommendation

**Use Vision API (Option 2)** because:
1. Carfax reports are structured/tabular
2. Need reliable field extraction (date/mileage/description/location/cost)
3. Better accuracy is worth the cost
4. Handles layout variations better

**Implementation:**
- Convert PDF pages to images (PNG, 2x scale for quality)
- Send all pages to Claude Vision in one request
- Claude extracts structured events with event types

**Optimization:**
- Can reduce image scale if cost is concern (1.5x instead of 2x)
- Can process pages in batches if PDF is very long
- Can cache results to avoid re-processing

---

## Next Steps

1. Implement vision-based extraction (already started)
2. Test with real Carfax PDFs
3. Measure accuracy vs cost
4. Optimize if needed (image scale, batching)

