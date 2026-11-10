# Download real product images from official/authorized sources
# Save to public/images/products/photos/

$outDir = "d:\Anil Communications\public\images\products\photos"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# Use TLS 1.2 for HTTPS
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Download-Image {
    param($url, $filename)
    $outPath = Join-Path $outDir $filename
    if (Test-Path $outPath) {
        Write-Host "SKIP (exists): $filename"
        return
    }
    try {
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $wc.Headers.Add("Accept", "image/webp,image/png,image/jpeg,image/*")
        $wc.DownloadFile($url, $outPath)
        $size = (Get-Item $outPath).Length
        if ($size -lt 1000) {
            Remove-Item $outPath -Force
            Write-Host "FAIL (too small ${size}b): $filename from $url"
        } else {
            Write-Host "OK ($([math]::Round($size/1024))KB): $filename"
        }
    } catch {
        Write-Host "FAIL: $filename - $($_.Exception.Message)"
    }
}

Write-Host "`n=== SMARTPHONES ==="

# Moto G37 Power - already has external URL
Download-Image "https://cdn.beebom.com/mobile/moto-g37-power-back-front.png" "moto-g37-power.png"

# OPPO A6 5G - official OPPO CDN
Download-Image "https://image.oppo.com/content/dam/oppo/product-asset-library/a/a6-5g/v1/assets/A6-Gold-Front-Back.png" "oppo-a6-5g.png"

# Vivo Y31T 5G
Download-Image "https://i.gadgets360cdn.com/large/vivo_y31t_5g_vivo_main_1786950340636.png" "vivo-y31t-5g.png"

# Realme C100 5G
Download-Image "https://img.advice.co.th/images_nas/pic_product4/A0180822/A0180822OK_ORI_1.jpg" "realme-c100-5g.jpg"

# Realme C100X - from Realme CDN
Download-Image "https://static2.realme.net/images/realme-c100x/1776760787171ef51b300dede44ea922009b5eb6e7013.webp" "realme-c100x.webp"

# Realme 16
Download-Image "https://backend.paiinternational.in/media/images/r_W2sdRnU.webp" "realme-16.webp"

# Realme 16X - from Realme India
Download-Image "https://image01.realme.net/general/20250605/1749137741203a66d0f97f18248548cf8b4f1e8dd0e39.png" "realme-16x.png"

# Realme 16 Pro
Download-Image "https://i.ebayimg.com/images/g/0BYAAeSwvltpXdLx/s-l1200.jpg" "realme-16-pro.jpg"

# Realme 16T - from Realme official
Download-Image "https://image01.realme.net/general/20260505/17465039555081a1a12aae5f04f0cafcea58a19b24f25.png" "realme-16t.png"

# Redmi A7 Pro - from GSMArena/Mi CDN
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a7-pro.jpg" "redmi-a7-pro.jpg"

# Realme 11X - from Realme official CDN
Download-Image "https://image01.realme.net/general/20230823/1692787834510b64dff4866f54ef4827fc471d2bfa1ca.png" "realme-11x.png"

# Vivo Y11 5G - from Vivo India
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/vivo-y11-5g.jpg" "vivo-y11-5g.jpg"

# POCO C85X - from POCO CDN
Download-Image "https://it-poco-bucket.azpn0.mi-fds.com//it-poco-bucket/product-details/C85X/Mobile/4.webp" "poco-c85x.webp"

# itel A100C
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/itel-a100c.jpg" "itel-a100c.jpg"

# Motorola G06 Power
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g06-power.jpg" "motorola-g06-power.jpg"

Write-Host "`n=== KEYPAD PHONES ==="

# Lava A3 Torch - from JioMart
Download-Image "https://www.jiomart.com/images/product/original/rvladyvkek/lava-a3-torch-dual-sim-dark-blue-keypad-phone-product-images-orvladyvkek-p612488038-4-202509190005.jpg" "lava-a3-torch.jpg"

# Cellecor Keypad Phone (generic model)
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/cellecor-e3.jpg" "cellecor-keypad.jpg"

# Lava A2 Smart
Download-Image "https://www.sathya.store/img/product/vryIx85lbfG6sDw7.png" "lava-a2-smart.png"

# Jio Bharat G2
Download-Image "https://www.jio.com/jio-bharat-phone-v2-black.png" "jio-bharat-g2.png"

# Cellecor CLI
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/cellecor-c1i.jpg" "cellecor-cli.jpg"

# itel Ace 2 Mega
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/itel-ace-2.jpg" "itel-ace-2-mega.jpg"

Write-Host "`n=== EARBUDS ==="

# boAt Airdopes 156 Nirvana
Download-Image "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/Airdopes_141.png" "boat-airdopes-156-nirvana.png"

# KDM Hop Pods
Download-Image "https://halfpe.com/cdn/shop/files/71xL8HG5X2L._SL1500.jpg" "kdm-hop-pods.jpg"

# Morbi Earbuds - niche brand, try available source
Download-Image "https://m.media-amazon.com/images/I/51YL9oPnHsL._SL1000_.jpg" "morbi-earbuds.jpg"

# boAt Airdopes 91 Prime
Download-Image "https://gadgetsense.in/wp-content/uploads/2025/07/boAt-Airdopes-91-Prime-1-e1759495251976.jpg" "boat-airdopes-91-prime.jpg"

# boAt Airdopes 213
Download-Image "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/airdopes-213-1.png" "boat-airdopes-213.png"

# KDM Fan Pods - niche brand
Download-Image "https://m.media-amazon.com/images/I/61j9mHXsm3L._SL1500_.jpg" "kdm-fan-pods.jpg"

Write-Host "`n=== NECKBANDS ==="

# KDM Evergreen
Download-Image "https://m.media-amazon.com/images/I/51PkO+BPLPL._SL1100_.jpg" "kdm-evergreen.jpg"

# KDM Alpha
Download-Image "https://m.media-amazon.com/images/I/51yvYIYJVHL._SL1100_.jpg" "kdm-alpha.jpg"

# KDM Daurandhar
Download-Image "https://m.media-amazon.com/images/I/51EPLWW5y5L._SL1100_.jpg" "kdm-daurandhar.jpg"

# KDM Noble Band
Download-Image "https://m.media-amazon.com/images/I/51dqI+RCSTL._SL1100_.jpg" "kdm-noble-band.jpg"

# KDM Vibronix
Download-Image "https://m.media-amazon.com/images/I/518YVQA3KAL._SL1100_.jpg" "kdm-vibronix.jpg"

# KDM Touchband
Download-Image "https://m.media-amazon.com/images/I/51vrXxPjNfL._SL1100_.jpg" "kdm-touchband.jpg"

# KDM Glamour
Download-Image "https://m.media-amazon.com/images/I/51Pby2BTWZL._SL1100_.jpg" "kdm-glamour.jpg"

# boAt Rockerz 103 Pro
Download-Image "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/m-black.png" "boat-rockerz-103-pro.png"

Write-Host "`n=== HEADPHONES ==="

# boAt Rockerz 425
Download-Image "https://www.bbassets.com/media/uploads/p/xl/40338188_1-boat-40mm-drivers-boat-signature-sound-25-hours-playtime-beast-mode-low-latency-bluetooth-v52-adaptive-fit-dual-pairing-type-c-interface-voice-assistant.jpg" "boat-rockerz-425.jpg"

# boAt Rockerz Trendz
Download-Image "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/rockerz-trendz-black.png" "boat-rockerz-trendz.png"

# Zebronics Headphones (model to confirm)
Download-Image "https://fdn2.gsmarena.com/vv/bigpic/zebronics-zeb-duke1.jpg" "zebronics-headphones.jpg"

Write-Host "`n=== DOWNLOAD COMPLETE ==="
Get-ChildItem $outDir | Select-Object Name, @{N="Size_KB";E={[math]::Round($_.Length/1024)}} | Format-Table -AutoSize

