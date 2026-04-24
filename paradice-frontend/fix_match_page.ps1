$file = 'app\play\match\page.tsx'
$lines = Get-Content $file

$newLines = New-Object System.Collections.Generic.List[string]
$i = 0
$fixed = $false

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # Line 948 (0-indexed: 947): '        ))}'
    # Line 949 (0-indexed: 948): '    );'
    # We need to detect this exact pattern and replace lines 948-957 with the correct closing
    if (-not $fixed -and $line.TrimEnd() -eq '        ))}') {
        $nextLine = if ($i+1 -lt $lines.Count) { $lines[$i+1] } else { '' }
        if ($nextLine.TrimEnd() -eq '    );') {
            # Output the corrected GameRules closing and CTAAndFooter function opening
            $newLines.Add($line)  # '        ))}'
            $newLines.Add('      </div>')
            $newLines.Add('    </section>')
            $newLines.Add('  );')
            $newLines.Add('}')
            $newLines.Add('')
            $newLines.Add('function CTAAndFooter() {')
            $newLines.Add('  const { t } = useLanguage();')
            $newLines.Add('  const containerRef = useRef<HTMLDivElement>(null);')
            $newLines.Add('')
            $newLines.Add('  useGSAP(() => {')
            $newLines.Add('    gsap.fromTo(".cta-box",')
            $newLines.Add('      { opacity: 0, scale: 0.9, y: 60 },')
            $newLines.Add('      { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none reset" } }')
            $newLines.Add('    );')
            # Skip lines i+1 through i+6 (lines 949-954 in 1-based):
            # 949: '    );'
            # 950: '    gsap.fromTo(".footer-column",'
            # 951: '      { opacity: 0, x: -40 },'
            # 952: '      { opacity: 1, x: 0, ...'
            # 953: '    );'
            # 954: '  }, { scope: containerRef });'
            # But we want to KEEP the footer-column gsap, just not re-add it yet
            # Actually we need to keep lines 950-954 as-is, just fix 949
            $newLines.Add($lines[$i+2])  # gsap.fromTo(".footer-column",
            $newLines.Add($lines[$i+3])  # { opacity: 0, x: -40 },
            $newLines.Add($lines[$i+4])  # { opacity: 1, x: 0, ...
            $newLines.Add($lines[$i+5])  # );
            $newLines.Add($lines[$i+6])  # }, { scope: containerRef });
            $i += 7  # skip i through i+6
            $fixed = $true
            continue
        }
    }
    
    $newLines.Add($line)
    $i++
}

Set-Content $file $newLines
Write-Host "Done. Fixed: $fixed"
