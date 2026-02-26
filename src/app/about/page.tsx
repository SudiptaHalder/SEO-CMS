import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { 
  User, 
  Calendar, 
  BookOpen, 
  Code, 
  Globe, 
  Mail, 
  Github, 
  Twitter, 
  Linkedin,
  Award,
  Heart
} from "lucide-react";

export const revalidate = 60;

async function getStats() {
  const postsCount = await prisma.post.count({
    where: { status: "PUBLISHED" }
  });

  const categoriesCount = await prisma.category.count();
  const tagsCount = await prisma.tag.count();

  return {
    posts: postsCount,
    categories: categoriesCount,
    tags: tagsCount
  };
}

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Me</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get to know the person behind the blog
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              JD
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">John Doe</h2>
            <p className="text-emerald-600 font-medium mb-3">Web Developer & SEO Enthusiast</p>
            <p className="text-gray-600 mb-4">
              I'm a passionate web developer with over 5 years of experience building modern web applications. 
              I specialize in creating fast, accessible, and SEO-friendly websites using cutting-edge technologies.
            </p>
            <div className="flex justify-center md:justify-start gap-3">
              <a href="#" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <Link href="/contact" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">{stats.posts}</p>
          <p className="text-sm text-gray-600">Published Posts</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Code className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">5+</p>
          <p className="text-sm text-gray-600">Years Experience</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Globe className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">10+</p>
          <p className="text-sm text-gray-600">Countries Reached</p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Story</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            I started my journey in web development about 5 years ago when I built my first website 
            using HTML and CSS. Since then, I've fallen in love with creating digital experiences 
            that are both beautiful and functional.
          </p>
          <p>
            Over the years, I've worked with various technologies including React, Next.js, Node.js, 
            and Python. I'm particularly passionate about SEO and how it can make content more 
            discoverable and accessible to people around the world.
          </p>
          <p>
            Through this blog, I share my knowledge and experiences to help other developers 
            improve their skills and build better websites. I believe in the power of community 
            and open source, and I'm always excited to connect with fellow developers.
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">React / Next.js</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">TypeScript / JavaScript</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">Tailwind CSS / CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">HTML5 / Responsive Design</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Backend & Tools</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">Node.js / Express</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">Python / Django</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">PostgreSQL / Prisma</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-700">Git / GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Open Source Contributor</h3>
              <p className="text-sm text-gray-600">Contributed to several popular open source projects</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Tech Conference Speaker</h3>
              <p className="text-sm text-gray-600">Spoke at local tech meetups about web development</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Blog Milestone</h3>
              <p className="text-sm text-gray-600">Reached 10,000 monthly readers across the globe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
