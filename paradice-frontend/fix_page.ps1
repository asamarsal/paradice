$file = 'app\page.tsx'
$lines = Get-Content $file

# Find the broken lines (around 952-958 based on viewer output)
# Lines 953-958 in 1-based index = indices 952-957 in 0-based

$newLines = New-Object System.Collections.Generic.List[string]
$i = 0
$fixed = $false

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # Detect the start of the broken section: '        ))}' followed by '    );'
    if (-not $fixed -and $line.TrimEnd() -eq '        ))}'  ) {
        # Check next line
        if ($i+1 -lt $lines.Count -and $lines[$i+1].TrimEnd() -eq '    );') {
            # This is the broken section - output correct GameRules closing
            $newLines.Add($line)  # '        ))}'
            $newLines.Add('      </div>')
            $newLines.Add('    </section>')
            $newLines.Add('  );')
            $newLines.Add('}')
            $newLines.Add('')
            $newLines.Add('function CTA() {')
            $newLines.Add('  const { t } = useLanguage();')
            $newLines.Add('  const containerRef = useRef<HTMLDivElement>(null);')
            $newLines.Add('')
            $newLines.Add('  useGSAP(() => {')
            $newLines.Add('    gsap.fromTo(".cta-box",')
            $newLines.Add('      { opacity: 0, scale: 0.9, y: 60 },')
            $newLines.Add('      { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none reset" } }')
            $newLines.Add('    );')
            $newLines.Add('  }, { scope: containerRef });')
            $newLines.Add('')
            $newLines.Add('  return (')
            # Skip the broken lines: '    );', '  }, { scope: containerRef });', '', '  return ('
            $i += 5  # skip indices i+1 through i+5
            $fixed = $true
            continue
        }
    }
    
    $newLines.Add($line)
    $i++
}

Set-Content $file $newLines
Write-Host "Done. Fixed: $fixed"
