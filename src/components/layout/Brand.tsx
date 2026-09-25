import Image from "next/image";
import Link from "next/link";

export default function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" aria-label="Moonlight Freight home" className={`brand-lockup ${inverse ? "brand-inverse" : ""}`}>
      <span className="brand-symbol" aria-hidden="true">
        <Image src="/images/moonlight-freight-logo.jpg" width={1081} height={1081} alt="" sizes="82px" />
      </span>
      <span className="brand-name">Moonlight<span className="brand-name-second">Freight<span className="brand-dot">.</span></span></span>
    </Link>
  );
}
