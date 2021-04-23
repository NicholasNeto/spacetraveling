import Link from "next/link";

export default function Header() {
  return (
    <>
      <Link href={"/"}>
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </>
  )
}
